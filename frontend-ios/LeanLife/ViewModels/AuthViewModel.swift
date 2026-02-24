import Foundation
import SwiftUI

/// Manages authentication state and user session
@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var user: User?
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIService.shared

    init() {
        if UserDefaults.standard.string(forKey: "accessToken") != nil {
            isAuthenticated = true
        }
    }

    func login(email: String, password: String) async {
        isLoading = true
        error = nil
        do {
            let response = try await api.login(email: email, password: password)
            user = response.user
            isAuthenticated = true
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func register(name: String, email: String, password: String) async {
        isLoading = true
        error = nil
        do {
            let response = try await api.register(name: name, email: email, password: password)
            user = response.user
            isAuthenticated = true
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func logout() {
        api.logout()
        user = nil
        isAuthenticated = false
    }
}
