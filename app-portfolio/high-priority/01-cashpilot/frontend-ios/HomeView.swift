// CashPilot iOS — SwiftUI hovedskjerm med autentisering, API-kall og dashboard
import SwiftUI

struct User: Codable, Identifiable {
    let id: String
    let name: String
    let email: String
    let level: Int
    let totalXp: Int
    let streakDays: Int
    let subscriptionTier: String
}

struct Lesson: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let category: String
    let difficulty: String
    let xpReward: Int
    let durationMinutes: Int
}

struct LessonCompletion: Codable {
    let xpEarned: Int
    let totalXp: Int
    let level: Int
    let streak: Int
}

struct ProgressData: Codable {
    let totalXp: Int
    let level: Int
    let streakDays: Int
    let lessonsCompleted: Int
    let lessonsTotal: Int
}

// Handles all API communication with the CashPilot backend
class APIService: ObservableObject {
    static let shared = APIService()
    private let baseURL = "https://api.cashpilot.app/v1"
    private var authToken: String?

    func setToken(_ token: String) {
        authToken = token
    }

    private func request<T: Decodable>(_ path: String, method: String = "GET", body: Data? = nil) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw URLError(.badURL)
        }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = authToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        req.httpBody = body
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(T.self, from: data)
    }

    func fetchProfile() async throws -> User {
        try await request("/users/me")
    }

    func fetchRecommendedLessons() async throws -> [Lesson] {
        try await request("/lessons/recommended")
    }

    func completeLesson(id: String, score: Int, time: Int) async throws -> LessonCompletion {
        let body = try JSONEncoder().encode(["lessonId": id, "score": "\(score)", "timeSpentSeconds": "\(time)"])
        return try await request("/lessons/\(id)/complete", method: "POST", body: body)
    }

    func fetchProgress() async throws -> ProgressData {
        try await request("/progress")
    }
}

// Main dashboard view showing user progress, next lesson, and budget summary
struct HomeView: View {
    @StateObject private var api = APIService.shared
    @State private var user: User?
    @State private var lessons: [Lesson] = []
    @State private var progress: ProgressData?
    @State private var isLoading = true
    @State private var showLogin = false

    var body: some View {
        NavigationStack {
            ScrollView {
                if isLoading {
                    ProgressView("Laster...")
                        .padding(.top, 100)
                } else if let user = user, let progress = progress {
                    VStack(spacing: 20) {
                        headerSection(user: user, progress: progress)
                        nextLessonSection
                        budgetSection
                        challengeSection
                    }
                    .padding()
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("CashPilot")
            .task { await loadData() }
            .sheet(isPresented: $showLogin) {
                LoginView { token in
                    api.setToken(token)
                    showLogin = false
                    Task { await loadData() }
                }
            }
        }
    }

    // Greeting, level, XP bar, and streak display
    private func headerSection(user: User, progress: ProgressData) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("God morgen, \(user.name)!")
                .font(.title2.bold())

            HStack {
                Label("Level \(user.level)", systemImage: "star.fill")
                    .foregroundColor(.blue)
                Text("·")
                Text("\(user.totalXp) XP")
                    .foregroundColor(.secondary)
                Text("·")
                Label("\(user.streakDays)", systemImage: "flame.fill")
                    .foregroundColor(.orange)
            }
            .font(.subheadline)

            let pct = Double(progress.lessonsCompleted) / max(Double(progress.lessonsTotal), 1)
            ProgressView(value: pct)
                .tint(.blue)
            Text("\(Int(pct * 100))% fullført")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
    }

    private var nextLessonSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Neste leksjon", systemImage: "book.fill")
                .font(.headline)

            if let lesson = lessons.first {
                NavigationLink(destination: LessonDetailView(lesson: lesson)) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(lesson.title)
                                .font(.body.bold())
                                .foregroundColor(.primary)
                            HStack(spacing: 8) {
                                Label("\(lesson.durationMinutes) min", systemImage: "clock")
                                Label("\(lesson.xpReward) XP", systemImage: "sparkles")
                                DifficultyBadge(level: lesson.difficulty)
                            }
                            .font(.caption)
                            .foregroundColor(.secondary)
                        }
                        Spacer()
                        Image(systemName: "chevron.right.circle.fill")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                    .padding()
                    .background(Color.blue.opacity(0.08))
                    .cornerRadius(12)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
    }

    private var budgetSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Budsjett denne måneden", systemImage: "banknote")
                .font(.headline)
            ProgressView(value: 0.68)
                .tint(.green)
            Text("kr 13,600 / kr 20,000 (68%)")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
    }

    private var challengeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Utfordringer", systemImage: "trophy.fill")
                .font(.headline)
            HStack {
                Text("30-dagers sparesprint")
                Spacer()
                Text("12/30")
                    .bold()
                    .foregroundColor(.orange)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
    }

    private func loadData() async {
        isLoading = true
        do {
            async let u = api.fetchProfile()
            async let l = api.fetchRecommendedLessons()
            async let p = api.fetchProgress()
            user = try await u
            lessons = try await l
            progress = try await p
        } catch {
            showLogin = true
        }
        isLoading = false
    }
}

struct DifficultyBadge: View {
    let level: String
    var color: Color {
        switch level {
        case "beginner": return .green
        case "intermediate": return .orange
        default: return .red
        }
    }
    var body: some View {
        Text(level.capitalized)
            .font(.caption2.bold())
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.15))
            .foregroundColor(color)
            .cornerRadius(4)
    }
}

struct LessonDetailView: View {
    let lesson: Lesson
    var body: some View {
        Text(lesson.title)
            .navigationTitle(lesson.title)
    }
}

struct LoginView: View {
    let onLogin: (String) -> Void
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        VStack(spacing: 20) {
            Text("Logg inn på CashPilot")
                .font(.title2.bold())
            TextField("E-post", text: $email)
                .textFieldStyle(.roundedBorder)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
            SecureField("Passord", text: $password)
                .textFieldStyle(.roundedBorder)
            Button("Logg inn") {
                onLogin("demo_token_\(email)")
            }
            .buttonStyle(.borderedProminent)
            .disabled(email.isEmpty || password.isEmpty)
        }
        .padding()
    }
}

#Preview {
    HomeView()
}
