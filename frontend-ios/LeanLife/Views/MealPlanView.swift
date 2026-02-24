import SwiftUI

struct MealPlanView: View {
    @State private var plan: MealPlanResponse?
    @State private var isLoading = false
    @State private var isGenerating = false

    private let api = APIService.shared

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView("Laster plan...")
                } else if let meals = plan?.meals {
                    List(meals, id: \.day) { day in
                        Section(day.day) {
                            MealRow(label: "Frokost", name: day.meals.breakfast.name, cal: day.meals.breakfast.calories)
                            MealRow(label: "Lunsj", name: day.meals.lunch.name, cal: day.meals.lunch.calories)
                            MealRow(label: "Middag", name: day.meals.dinner.name, cal: day.meals.dinner.calories)
                            MealRow(label: "Snack", name: day.meals.snack.name, cal: day.meals.snack.calories)
                            HStack {
                                Spacer()
                                Text("Totalt: \(day.totalCalories) kcal")
                                    .font(.caption.monospaced().bold())
                                    .foregroundStyle(.green)
                            }
                        }
                    }
                } else {
                    ContentUnavailableView {
                        Label("Ingen plan", systemImage: "list.clipboard")
                    } description: {
                        Text("Generer en personlig ukesplan.")
                    } actions: {
                        Button("Generer plan") {
                            Task { await generatePlan() }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.green)
                    }
                }
            }
            .navigationTitle("Måltidsplan")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        Task { await generatePlan() }
                    } label: {
                        if isGenerating {
                            ProgressView()
                        } else {
                            Image(systemName: "arrow.clockwise")
                        }
                    }
                    .disabled(isGenerating)
                }
            }
            .task { await loadPlan() }
        }
    }

    private func loadPlan() async {
        isLoading = true
        plan = try? await api.request(endpoint: "/meals/plan")
        isLoading = false
    }

    private func generatePlan() async {
        isGenerating = true
        plan = try? await api.request(endpoint: "/meals/generate", method: "POST")
        isGenerating = false
    }
}

struct MealRow: View {
    let label: String
    let name: String
    let cal: Int

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(label).font(.caption).foregroundStyle(.secondary)
                Text(name).font(.subheadline)
            }
            Spacer()
            Text("\(cal) kcal")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
        }
    }
}

// Response models for meal plan
struct MealPlanResponse: Decodable {
    let id: String
    let meals: [DayPlan]
}

struct DayPlan: Decodable {
    let day: String
    let meals: DayMeals
    let totalCalories: Int
}

struct DayMeals: Decodable {
    let breakfast: SimpleMeal
    let lunch: SimpleMeal
    let dinner: SimpleMeal
    let snack: SimpleMeal
}

struct SimpleMeal: Decodable {
    let name: String
    let calories: Int
    let protein: Int
    let carbs: Int
    let fat: Int
}
