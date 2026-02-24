import SwiftUI

struct WeightView: View {
    @State private var weight = ""
    @State private var entries: [WeightEntry] = []
    @State private var stats: WeightStats?
    @State private var message = ""
    @State private var isLogging = false

    private let api = APIService.shared

    var body: some View {
        NavigationStack {
            List {
                Section("Logg vekt") {
                    HStack {
                        TextField("Vekt (kg)", text: $weight)
                            .keyboardType(.decimalPad)
                            .textFieldStyle(.roundedBorder)

                        Button("Logg") {
                            Task { await logWeight() }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.green)
                        .disabled(isLogging || weight.isEmpty)
                    }

                    if !message.isEmpty {
                        Text(message)
                            .font(.caption)
                            .foregroundStyle(.green)
                    }
                }

                if let stats = stats {
                    Section("Statistikk") {
                        StatRow(label: "Nåværende", value: "\(String(format: "%.1f", stats.current)) kg")
                        StatRow(label: "Mål", value: "\(String(format: "%.1f", stats.goal)) kg")
                        StatRow(label: "BMI", value: String(format: "%.1f", stats.bmi))
                        StatRow(label: "Totalt endring", value: "\(stats.totalChange > 0 ? "+" : "")\(String(format: "%.1f", stats.totalChange)) kg")
                        StatRow(label: "Gjenstår", value: "\(String(format: "%.1f", stats.remaining)) kg")
                    }
                }

                Section("Historikk") {
                    ForEach(entries.reversed()) { entry in
                        HStack {
                            Text(entry.date.prefix(10))
                                .font(.subheadline.monospaced())
                            Spacer()
                            Text("\(String(format: "%.1f", entry.weightKg)) kg")
                                .font(.subheadline.monospaced().bold())
                        }
                    }
                }
            }
            .navigationTitle("Vektlogg")
            .task { await loadData() }
        }
    }

    private func logWeight() async {
        guard let kg = Double(weight) else { return }
        isLogging = true
        let today = DashboardViewModel.dateString(Date())
        do {
            _ = try await api.logWeight(weightKg: kg, date: today)
            weight = ""
            message = "Vekt logget!"
            await loadData()
        } catch {
            message = error.localizedDescription
        }
        isLogging = false
    }

    private func loadData() async {
        let thirtyDaysAgo = DashboardViewModel.dateString(Date().addingTimeInterval(-30 * 86400))
        let today = DashboardViewModel.dateString(Date())
        entries = (try? await api.getWeightEntries(from: thirtyDaysAgo, to: today)) ?? []
        stats = try? await api.getWeightStats()
    }
}

struct StatRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label).foregroundStyle(.secondary)
            Spacer()
            Text(value).font(.subheadline.monospaced().bold())
        }
    }
}
