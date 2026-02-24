import Foundation

/// Handles food search and logging
@MainActor
class FoodViewModel: ObservableObject {
    @Published var searchResults: [FoodItem] = []
    @Published var todaysLog: DailyFoodLog?
    @Published var isSearching = false
    @Published var isLogging = false

    private let api = APIService.shared

    func search(query: String) async {
        guard query.count >= 2 else {
            searchResults = []
            return
        }
        isSearching = true
        do {
            searchResults = try await api.searchFood(query: query)
        } catch {
            searchResults = []
        }
        isSearching = false
    }

    func logFood(foodId: String, amount: Double, mealType: String) async -> Bool {
        isLogging = true
        let today = DashboardViewModel.dateString(Date())
        do {
            _ = try await api.logFood(foodId: foodId, amount: amount, mealType: mealType, date: today)
            await loadTodaysLog()
            isLogging = false
            return true
        } catch {
            isLogging = false
            return false
        }
    }

    func loadTodaysLog() async {
        let today = DashboardViewModel.dateString(Date())
        do {
            todaysLog = try await api.getDailyFoodLog(date: today)
        } catch { }
    }
}
