import Foundation

struct WeightEntry: Codable, Identifiable {
    let id: String
    let weightKg: Double
    let date: String
    let note: String?
}

struct WeightStats: Codable {
    let current: Double
    let start: Double?
    let goal: Double
    let bmi: Double
    let totalChange: Double
    let weeklyChange: Double?
    let remaining: Double
}
