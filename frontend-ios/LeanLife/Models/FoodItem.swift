import Foundation

struct FoodItem: Codable, Identifiable {
    let id: String
    let name: String
    let brand: String?
    let calories: Double
    let protein: Double
    let carbs: Double
    let fat: Double
    let fiber: Double
    let servingG: Double
}

struct FoodLog: Codable, Identifiable {
    let id: String
    let foodId: String
    let amount: Double
    let unit: String
    let mealType: String
    let date: String
    let food: FoodItem
}

struct DailyFoodLog: Codable {
    let date: String
    let logs: [FoodLog]
    let summary: NutritionSummary
}

struct NutritionSummary: Codable {
    let calories: Int
    let protein: Double
    let carbs: Double
    let fat: Double
    let fiber: Double
}
