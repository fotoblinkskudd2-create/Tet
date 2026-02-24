// DebtZero iOS — Gjeldsoversikt med nedtelling, plan og milepæler
import SwiftUI

struct Debt: Codable, Identifiable {
    let id: String
    let name: String
    let type: String
    let balance: Double
    let interestRate: Double
    let minimumPayment: Double
    let isFocus: Bool
}

struct DebtPlan: Codable {
    let method: String
    let totalInterestSaved: Double
    let payoffDate: String
    let monthlyExtra: Double
}

struct DebtProgress: Codable {
    let totalDebt: Double
    let totalPaid: Double
    let percentPaid: Double
    let payoffDate: String
    let nextMilestone: String
}

class DebtZeroAPI: ObservableObject {
    private let base = "https://api.debtzero.app/v1"
    var token = ""

    func fetchDebts() async throws -> [Debt] {
        try await get("/debts")
    }

    func fetchProgress() async throws -> DebtProgress {
        try await get("/progress")
    }

    private func get<T: Decodable>(_ path: String) async throws -> T {
        var req = URLRequest(url: URL(string: "\(base)\(path)")!)
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(T.self, from: data)
    }
}

// Main debt dashboard with total overview, individual debts, and milestones
struct DebtDashboardView: View {
    @StateObject private var api = DebtZeroAPI()
    @State private var debts: [Debt] = []
    @State private var progress: DebtProgress?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    progressCard
                    debtList
                    milestoneCard
                }
                .padding()
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationTitle("DebtZero")
            .task { await load() }
        }
    }

    private var progressCard: some View {
        VStack(spacing: 12) {
            Text("Total gjeld")
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.8))

            if let p = progress {
                Text("$\(Int(p.totalDebt - p.totalPaid).formatted())")
                    .font(.system(size: 40, weight: .bold))
                    .foregroundColor(.white)

                ProgressView(value: p.percentPaid / 100)
                    .tint(.green)
                    .scaleEffect(y: 2)
                    .padding(.horizontal)

                Text("\(Int(p.percentPaid))% betalt · Gjeldfri: \(p.payoffDate)")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 28)
        .background(LinearGradient(colors: [Color(hex: "4F46E5"), Color(hex: "7C3AED")], startPoint: .topLeading, endPoint: .bottomTrailing))
        .cornerRadius(20)
    }

    private var debtList: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Dine gjelder")
                .font(.headline)

            ForEach(debts) { debt in
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(debt.name)
                                .font(.body.bold())
                            if debt.isFocus {
                                Text("FOKUS")
                                    .font(.caption2.bold())
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color.orange.opacity(0.2))
                                    .foregroundColor(.orange)
                                    .cornerRadius(4)
                            }
                        }
                        Text("\(String(format: "%.1f", debt.interestRate))% · $\(Int(debt.minimumPayment))/mnd")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Text("$\(Int(debt.balance).formatted())")
                        .font(.title3.bold())
                        .foregroundColor(.red)
                }
                .padding()
                .background(Color.white)
                .cornerRadius(12)
            }
        }
    }

    private var milestoneCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Neste milepæl", systemImage: "target")
                .font(.headline)
            if let p = progress {
                Text(p.nextMilestone)
                    .font(.body)
                    .foregroundColor(.secondary)
            }
            Button("Registrer betaling") { }
                .buttonStyle(.borderedProminent)
                .tint(Color(hex: "4F46E5"))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }

    private func load() async {
        debts = [
            Debt(id: "1", name: "Studielån", type: "student_loan", balance: 82000, interestRate: 4.5, minimumPayment: 450, isFocus: false),
            Debt(id: "2", name: "Visa kredittkort", type: "credit_card", balance: 15000, interestRate: 24.9, minimumPayment: 300, isFocus: true),
            Debt(id: "3", name: "Billån", type: "car_loan", balance: 5000, interestRate: 6.0, minimumPayment: 200, isFocus: false),
        ]
        progress = DebtProgress(totalDebt: 102000, totalPaid: 34680, percentPaid: 34, payoffDate: "mars 2029", nextMilestone: "Betal av Visa → spar $8,200 i renter")
    }
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(red: Double((rgb >> 16) & 0xFF) / 255, green: Double((rgb >> 8) & 0xFF) / 255, blue: Double(rgb & 0xFF) / 255)
    }
}
