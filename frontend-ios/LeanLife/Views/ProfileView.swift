import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @State private var profile: HealthProfile?
    @State private var isLoading = true

    private let api = APIService.shared

    var body: some View {
        NavigationStack {
            List {
                Section("Konto") {
                    if let user = authVM.user {
                        HStack {
                            ZStack {
                                Circle()
                                    .fill(.green.opacity(0.15))
                                    .frame(width: 50, height: 50)
                                Text(String(user.name.prefix(1)))
                                    .font(.title2.bold())
                                    .foregroundStyle(.green)
                            }
                            VStack(alignment: .leading) {
                                Text(user.name).font(.headline)
                                Text(user.email)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }

                if let p = profile {
                    Section("Helseprofil") {
                        ProfileRow(label: "Høyde", value: "\(Int(p.heightCm)) cm")
                        ProfileRow(label: "Målvekt", value: "\(String(format: "%.1f", p.goalWeightKg)) kg")
                        ProfileRow(label: "Daglig mål", value: "\(p.dailyTarget) kcal")
                        ProfileRow(label: "BMR", value: "\(Int(p.bmr)) kcal")
                        ProfileRow(label: "TDEE", value: "\(Int(p.tdee)) kcal")
                        ProfileRow(label: "Aktivitet", value: activityLabel(p.activityLevel))
                    }
                } else if !isLoading {
                    Section {
                        Text("Helseprofil ikke opprettet ennå. Bruk webappen for å sette opp profilen.")
                            .foregroundStyle(.secondary)
                    }
                }

                Section {
                    Button("Logg ut", role: .destructive) {
                        authVM.logout()
                    }
                }
            }
            .navigationTitle("Profil")
            .task {
                profile = try? await api.getProfile()
                isLoading = false
            }
        }
    }

    private func activityLabel(_ level: String) -> String {
        switch level {
        case "SEDENTARY": return "Stillesittende"
        case "LIGHT": return "Lett aktiv"
        case "MODERATE": return "Moderat aktiv"
        case "ACTIVE": return "Aktiv"
        case "VERY_ACTIVE": return "Svært aktiv"
        default: return level
        }
    }
}

struct ProfileRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label).foregroundStyle(.secondary)
            Spacer()
            Text(value).font(.subheadline.monospaced())
        }
    }
}
