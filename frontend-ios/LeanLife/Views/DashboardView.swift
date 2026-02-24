import SwiftUI

struct DashboardView: View {
    @StateObject private var vm = DashboardViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    calorieCard
                    weightCard
                }
                .padding()
            }
            .navigationTitle("Hjem")
            .refreshable { await vm.load() }
            .task { await vm.load() }
        }
    }

    private var calorieCard: some View {
        VStack(spacing: 16) {
            Text("Dagens kalorier")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)

            let consumed = vm.nutrition?.calories ?? 0
            let target = vm.dailyTarget
            let progress = min(Double(consumed) / Double(target), 1.0)

            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.15), lineWidth: 16)
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        consumed > target ? Color.red : Color.green,
                        style: StrokeStyle(lineWidth: 16, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.easeOut(duration: 0.7), value: progress)

                VStack(spacing: 4) {
                    Text("\(consumed)")
                        .font(.system(size: 36, weight: .bold, design: .monospaced))
                    Text("av \(target) kcal")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 160, height: 160)

            HStack(spacing: 24) {
                MacroView(name: "Protein", value: vm.nutrition?.protein ?? 0, color: .blue)
                MacroView(name: "Karbo", value: vm.nutrition?.carbs ?? 0, color: .orange)
                MacroView(name: "Fett", value: vm.nutrition?.fat ?? 0, color: .pink)
            }
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var weightCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Vektutvikling")
                    .font(.headline)
                Spacer()
                if let stats = vm.weightStats {
                    Text("\(String(format: "%.1f", stats.current)) kg")
                        .font(.subheadline.monospaced())
                        .foregroundStyle(.green)
                }
            }

            if vm.weightEntries.isEmpty {
                Text("Ingen vektdata ennå. Logg din første vekt!")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                // Simple bar representation
                HStack(alignment: .bottom, spacing: 2) {
                    ForEach(vm.weightEntries.suffix(14), id: \.id) { entry in
                        let min = (vm.weightEntries.map(\.weightKg).min() ?? 60) - 2
                        let max = (vm.weightEntries.map(\.weightKg).max() ?? 100) + 2
                        let normalized = (entry.weightKg - min) / (max - min)
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.green.opacity(0.7))
                            .frame(height: max(4, CGFloat(normalized) * 100))
                    }
                }
                .frame(height: 100)
            }

            if let stats = vm.weightStats {
                HStack(spacing: 16) {
                    StatBadge(label: "Mål", value: "\(String(format: "%.1f", stats.goal)) kg")
                    StatBadge(label: "BMI", value: String(format: "%.1f", stats.bmi))
                    StatBadge(label: "Gjenstår", value: "\(String(format: "%.1f", stats.remaining)) kg")
                }
            }
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct MacroView: View {
    let name: String
    let value: Double
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(String(format: "%.0f g", value))
                .font(.subheadline.monospaced().bold())
            Text(name)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(color.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct StatBadge: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.subheadline.monospaced().bold())
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }
}
