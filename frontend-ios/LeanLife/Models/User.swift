import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let subscription: String?
}

struct AuthResponse: Codable {
    let user: User
    let accessToken: String
    let refreshToken: String
}

struct HealthProfile: Codable {
    let id: String
    let heightCm: Double
    let goalWeightKg: Double
    let activityLevel: String
    let birthDate: String
    let sex: String
    let bmr: Double
    let tdee: Double
    let dailyTarget: Int
}
