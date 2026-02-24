import SwiftUI

@main
struct LeanLifeApp: App {
    @StateObject private var authVM = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            if authVM.isAuthenticated {
                TabView {
                    DashboardView()
                        .tabItem { Label("Hjem", systemImage: "house.fill") }
                    FoodLogView()
                        .tabItem { Label("Mat", systemImage: "fork.knife") }
                    WeightView()
                        .tabItem { Label("Vekt", systemImage: "scalemass.fill") }
                    MealPlanView()
                        .tabItem { Label("Plan", systemImage: "list.bullet.clipboard") }
                    ProfileView()
                        .tabItem { Label("Profil", systemImage: "person.fill") }
                }
                .environmentObject(authVM)
                .tint(.green)
            } else {
                LoginView()
                    .environmentObject(authVM)
            }
        }
    }
}
