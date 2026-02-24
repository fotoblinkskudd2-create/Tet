import SwiftUI

struct FoodLogView: View {
    @StateObject private var vm = FoodViewModel()
    @State private var searchText = ""
    @State private var selectedFood: FoodItem?
    @State private var amount: String = "100"
    @State private var mealType = "LUNCH"

    var body: some View {
        NavigationStack {
            List {
                searchSection
                if selectedFood != nil { logSection }
                todaysLogSection
            }
            .navigationTitle("Logg mat")
            .task { await vm.loadTodaysLog() }
        }
    }

    private var searchSection: some View {
        Section("Søk matvare") {
            TextField("Søk etter matvare...", text: $searchText)
                .textFieldStyle(.roundedBorder)
                .onChange(of: searchText) { _, newValue in
                    Task { await vm.search(query: newValue) }
                }

            if vm.isSearching {
                ProgressView("Søker...")
            }

            ForEach(vm.searchResults) { food in
                Button {
                    selectedFood = food
                    searchText = ""
                    vm.searchResults = []
                } label: {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(food.name).font(.subheadline.bold())
                            Text("per \(Int(food.servingG))g")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text("\(Int(food.calories)) kcal")
                            .font(.subheadline.monospaced())
                            .foregroundStyle(.green)
                    }
                }
                .foregroundStyle(.primary)
            }
        }
    }

    private var logSection: some View {
        Section("Logg") {
            if let food = selectedFood {
                VStack(alignment: .leading, spacing: 8) {
                    Text(food.name).font(.headline)
                    HStack {
                        TextField("Mengde (g)", text: $amount)
                            .keyboardType(.decimalPad)
                            .textFieldStyle(.roundedBorder)
                            .frame(width: 100)

                        Picker("Måltid", selection: $mealType) {
                            Text("Frokost").tag("BREAKFAST")
                            Text("Lunsj").tag("LUNCH")
                            Text("Middag").tag("DINNER")
                            Text("Snack").tag("SNACK")
                        }
                        .pickerStyle(.menu)
                    }

                    let amt = Double(amount) ?? 0
                    let cals = Int(food.calories * amt / food.servingG)
                    Text("Totalt: \(cals) kcal")
                        .font(.subheadline.monospaced())
                        .foregroundStyle(.green)

                    Button("Logg mat") {
                        Task {
                            let success = await vm.logFood(
                                foodId: food.id,
                                amount: amt,
                                mealType: mealType
                            )
                            if success { selectedFood = nil; amount = "100" }
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)
                    .disabled(vm.isLogging)
                }
            }
        }
    }

    private var todaysLogSection: some View {
        Section("I dag — \(vm.todaysLog?.summary.calories ?? 0) kcal") {
            if let logs = vm.todaysLog?.logs, !logs.isEmpty {
                ForEach(logs) { log in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(log.food.name).font(.subheadline)
                            Text("\(Int(log.amount))g · \(mealLabel(log.mealType))")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text("\(Int(log.food.calories * log.amount / log.food.servingG)) kcal")
                            .font(.subheadline.monospaced())
                    }
                }
            } else {
                Text("Ingen mat logget ennå i dag.")
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func mealLabel(_ type: String) -> String {
        switch type {
        case "BREAKFAST": return "Frokost"
        case "LUNCH": return "Lunsj"
        case "DINNER": return "Middag"
        case "SNACK": return "Snack"
        default: return type
        }
    }
}
