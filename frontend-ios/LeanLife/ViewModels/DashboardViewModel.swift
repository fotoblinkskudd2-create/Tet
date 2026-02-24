import Foundation

/// Fetches and manages dashboard data (daily nutrition, weight trend)
@MainActor
class DashboardViewModel: ObservableObject {
    @Published var nutrition: NutritionSummary?
    @Published var dailyTarget: Int = 2000
    @Published var weightEntries: [WeightEntry] = []
    @Published var weightStats: WeightStats?
    @Published var isLoading = false

    private let api = APIService.shared

    func load() async {
        isLoading = true
        let today = Self.dateString(Date())
        let thirtyDaysAgo = Self.dateString(Date().addingTimeInterval(-30 * 86400))

        async let foodLog = api.getDailyFoodLog(date: today)
        async let profile = api.getProfile()
        async let weights = api.getWeightEntries(from: thirtyDaysAgo, to: today)
        async let stats = api.getWeightStats()

        do {
            let fl = try await foodLog
            nutrition = fl.summary
        } catch { }

        do {
            let p = try await profile
            dailyTarget = p.dailyTarget
        } catch { }

        do { weightEntries = try await weights } catch { }
        do { weightStats = try await stats } catch { }

        isLoading = false
    }

    static func dateString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }
}
