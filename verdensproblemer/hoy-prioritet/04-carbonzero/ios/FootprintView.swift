// CarbonZero iOS — Karbonavtrykk-dashboard med sporing, utfordringer og offset
import SwiftUI

// MARK: - Models

struct FootprintSummary: Codable {
    let totalKg: Double
    let monthlyAvgKg: Double
    let breakdown: [CategoryBreakdown]
    let trend: String

    enum CodingKeys: String, CodingKey {
        case totalKg = "total_kg"
        case monthlyAvgKg = "monthly_avg_kg"
        case breakdown, trend
    }
}

struct CategoryBreakdown: Codable, Identifiable {
    var id: String { category }
    let category: String
    let kg: Double
    let percentage: Double
}

struct Challenge: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let co2SavingKg: Double
    let durationDays: Int
    let category: String

    enum CodingKeys: String, CodingKey {
        case id, title, description, category
        case co2SavingKg = "co2_saving_kg"
        case durationDays = "duration_days"
    }
}

struct ActivityLog: Codable {
    let category: String
    let co2Kg: Double
    let description: String

    enum CodingKeys: String, CodingKey {
        case category, description
        case co2Kg = "co2_kg"
    }
}

// MARK: - API Service

class CarbonAPI {
    static let shared = CarbonAPI()
    private let baseURL = "https://api.carbonzero.app/v1"

    private func authHeaders() -> [String: String] {
        var h = ["Content-Type": "application/json"]
        if let token = UserDefaults.standard.string(forKey: "cz_token") {
            h["Authorization"] = "Bearer \(token)"
        }
        return h
    }

    func fetchSummary() async throws -> FootprintSummary {
        var req = URLRequest(url: URL(string: "\(baseURL)/footprint/summary")!)
        authHeaders().forEach { req.setValue($0.value, forHTTPHeaderField: $0.key) }
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(FootprintSummary.self, from: data)
    }

    func logActivity(_ activity: ActivityLog) async throws {
        var req = URLRequest(url: URL(string: "\(baseURL)/activities")!)
        req.httpMethod = "POST"
        authHeaders().forEach { req.setValue($0.value, forHTTPHeaderField: $0.key) }
        req.httpBody = try JSONEncoder().encode(activity)
        let (_, _) = try await URLSession.shared.data(for: req)
    }

    func fetchChallenges() async throws -> [Challenge] {
        var req = URLRequest(url: URL(string: "\(baseURL)/challenges")!)
        authHeaders().forEach { req.setValue($0.value, forHTTPHeaderField: $0.key) }
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode([Challenge].self, from: data)
    }
}

// MARK: - ViewModel

@MainActor
class FootprintViewModel: ObservableObject {
    @Published var summary: FootprintSummary?
    @Published var challenges: [Challenge] = []
    @Published var isLoading = false

    func load() async {
        isLoading = true
        do {
            async let s = CarbonAPI.shared.fetchSummary()
            async let c = CarbonAPI.shared.fetchChallenges()
            summary = try await s
            challenges = try await c
        } catch {
            print("Load error: \(error)")
        }
        isLoading = false
    }

    func logActivity(category: String, kg: Double, description: String) async {
        let activity = ActivityLog(category: category, co2Kg: kg, description: description)
        try? await CarbonAPI.shared.logActivity(activity)
        await load()
    }
}

// MARK: - Views

struct FootprintDashboard: View {
    @StateObject private var vm = FootprintViewModel()
    @State private var showLogger = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    if let summary = vm.summary {
                        TotalCard(summary: summary)
                        BreakdownSection(breakdown: summary.breakdown)
                    }

                    ChallengesSection(challenges: vm.challenges)

                    QuickLogSection(onLog: { cat, kg, desc in
                        Task { await vm.logActivity(category: cat, kg: kg, description: desc) }
                    })
                }
                .padding()
            }
            .navigationTitle("CarbonZero")
            .task { await vm.load() }
            .refreshable { await vm.load() }
        }
    }
}

struct TotalCard: View {
    let summary: FootprintSummary

    var body: some View {
        VStack(spacing: 12) {
            Text("Ditt karbonavtrykk")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            ZStack {
                Circle()
                    .stroke(Color.green.opacity(0.2), lineWidth: 12)
                    .frame(width: 160, height: 160)
                Circle()
                    .trim(from: 0, to: min(summary.totalKg / 5000, 1.0))
                    .stroke(summary.totalKg > 4000 ? Color.red : Color.green, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .frame(width: 160, height: 160)
                    .rotationEffect(.degrees(-90))
                VStack {
                    Text(String(format: "%.0f", summary.totalKg))
                        .font(.system(size: 36, weight: .bold))
                    Text("kg CO₂")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            HStack(spacing: 20) {
                StatBadge(label: "Måned snitt", value: "\(Int(summary.monthlyAvgKg)) kg")
                StatBadge(label: "Trend", value: summary.trend == "improving" ? "📉 Bedre" : "📈 Stabil")
            }
        }
        .padding()
        .background(Color.green.opacity(0.05))
        .cornerRadius(20)
    }
}

struct StatBadge: View {
    let label: String
    let value: String

    var body: some View {
        VStack {
            Text(value).font(.headline)
            Text(label).font(.caption2).foregroundStyle(.secondary)
        }
    }
}

struct BreakdownSection: View {
    let breakdown: [CategoryBreakdown]

    let icons: [String: String] = [
        "transport": "🚗", "food": "🍖", "energy": "⚡", "shopping": "🛍️", "other": "📦"
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Fordeling").font(.headline)
            ForEach(breakdown) { item in
                HStack {
                    Text(icons[item.category] ?? "📦")
                    Text(item.category.capitalized)
                        .font(.subheadline)
                    Spacer()
                    Text("\(Int(item.kg)) kg")
                        .font(.subheadline.bold())
                    Text("(\(Int(item.percentage))%)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                ProgressView(value: item.percentage / 100)
                    .tint(item.percentage > 40 ? .red : .green)
            }
        }
        .padding()
        .background(.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8)
    }
}

struct ChallengesSection: View {
    let challenges: [Challenge]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Ukens utfordringer").font(.headline)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(challenges) { challenge in
                        ChallengeCard(challenge: challenge)
                    }
                }
            }
        }
    }
}

struct ChallengeCard: View {
    let challenge: Challenge

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(challenge.title)
                .font(.subheadline.bold())
                .lineLimit(2)
            Text(challenge.description)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)
            HStack {
                Image(systemName: "leaf.fill")
                    .foregroundStyle(.green)
                Text("Spar \(Int(challenge.co2SavingKg)) kg CO₂")
                    .font(.caption.bold())
                    .foregroundStyle(.green)
            }
            Button("Bli med") {}
                .buttonStyle(.bordered)
                .tint(.green)
                .controlSize(.small)
        }
        .frame(width: 180)
        .padding()
        .background(Color.green.opacity(0.05))
        .cornerRadius(16)
    }
}

struct QuickLogSection: View {
    let onLog: (String, Double, String) -> Void

    let quickItems: [(String, String, Double)] = [
        ("🚗 Biltur 10km", "transport", 2.1),
        ("✈️ Fly 1t", "transport", 90),
        ("🥩 Biff-middag", "food", 6.5),
        ("🥗 Vegetar-dag", "food", -1.5),
        ("🚿 Lang dusj", "energy", 1.2),
        ("👕 Nytt plagg", "shopping", 5.0),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Rask logging").font(.headline)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                ForEach(quickItems, id: \.0) { item in
                    Button {
                        onLog(item.1, item.2, item.0)
                    } label: {
                        HStack {
                            Text(item.0).font(.caption)
                            Spacer()
                            Text(item.2 > 0 ? "+\(String(format: "%.1f", item.2))" : "\(String(format: "%.1f", item.2))")
                                .font(.caption.bold())
                                .foregroundStyle(item.2 > 0 ? .red : .green)
                        }
                        .padding(12)
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

// App entry
struct CarbonZeroApp: App {
    var body: some Scene {
        WindowGroup {
            TabView {
                FootprintDashboard()
                    .tabItem { Label("Dashboard", systemImage: "leaf.fill") }
                Text("Logger")
                    .tabItem { Label("Logg", systemImage: "plus.circle") }
                Text("Utfordringer")
                    .tabItem { Label("Utfordringer", systemImage: "trophy.fill") }
                Text("Offset")
                    .tabItem { Label("Offset", systemImage: "arrow.3.trianglepath") }
            }
            .tint(.green)
        }
    }
}
