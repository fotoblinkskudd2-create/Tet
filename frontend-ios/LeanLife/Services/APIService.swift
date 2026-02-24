import Foundation

/// Central API client for communicating with the LeanLife backend
class APIService {
    static let shared = APIService()

    private let baseURL: String

    init(baseURL: String = "https://api.leanlife.app/v1") {
        self.baseURL = baseURL
    }

    private var token: String? {
        UserDefaults.standard.string(forKey: "accessToken")
    }

    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(http.statusCode) else {
            if let errorBody = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw APIError.server(errorBody.error)
            }
            throw APIError.httpError(http.statusCode)
        }

        let decoder = JSONDecoder()
        return try decoder.decode(T.self, from: data)
    }

    // MARK: - Auth

    func login(email: String, password: String) async throws -> AuthResponse {
        struct LoginBody: Encodable { let email: String; let password: String }
        let response: AuthResponse = try await request(
            endpoint: "/auth/login",
            method: "POST",
            body: LoginBody(email: email, password: password)
        )
        UserDefaults.standard.set(response.accessToken, forKey: "accessToken")
        UserDefaults.standard.set(response.refreshToken, forKey: "refreshToken")
        return response
    }

    func register(name: String, email: String, password: String) async throws -> AuthResponse {
        struct RegisterBody: Encodable { let name: String; let email: String; let password: String }
        let response: AuthResponse = try await request(
            endpoint: "/auth/register",
            method: "POST",
            body: RegisterBody(name: name, email: email, password: password)
        )
        UserDefaults.standard.set(response.accessToken, forKey: "accessToken")
        UserDefaults.standard.set(response.refreshToken, forKey: "refreshToken")
        return response
    }

    // MARK: - Food

    func searchFood(query: String) async throws -> [FoodItem] {
        try await request(endpoint: "/food/search?q=\(query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query)")
    }

    func logFood(foodId: String, amount: Double, mealType: String, date: String) async throws -> FoodLog {
        struct Body: Encodable { let foodId: String; let amount: Double; let unit: String; let mealType: String; let date: String }
        return try await request(
            endpoint: "/food/log",
            method: "POST",
            body: Body(foodId: foodId, amount: amount, unit: "g", mealType: mealType, date: date)
        )
    }

    func getDailyFoodLog(date: String) async throws -> DailyFoodLog {
        try await request(endpoint: "/food/log?date=\(date)")
    }

    // MARK: - Weight

    func logWeight(weightKg: Double, date: String) async throws -> WeightEntry {
        struct Body: Encodable { let weightKg: Double; let date: String }
        return try await request(endpoint: "/weight", method: "POST", body: Body(weightKg: weightKg, date: date))
    }

    func getWeightEntries(from: String? = nil, to: String? = nil) async throws -> [WeightEntry] {
        var query = "/weight?"
        if let from = from { query += "from=\(from)&" }
        if let to = to { query += "to=\(to)" }
        return try await request(endpoint: query)
    }

    func getWeightStats() async throws -> WeightStats {
        try await request(endpoint: "/weight/stats")
    }

    // MARK: - Profile

    func getProfile() async throws -> HealthProfile {
        try await request(endpoint: "/profile")
    }

    func logout() {
        UserDefaults.standard.removeObject(forKey: "accessToken")
        UserDefaults.standard.removeObject(forKey: "refreshToken")
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Ugyldig URL"
        case .invalidResponse: return "Ugyldig respons"
        case .httpError(let code): return "HTTP-feil: \(code)"
        case .server(let msg): return msg
        }
    }
}

struct ErrorResponse: Decodable {
    let error: String
}
