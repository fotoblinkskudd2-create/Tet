// MindWell iOS — Hovedskjerm med autentisering, API-kall og navigasjon
import SwiftUI
import Combine

// MARK: - Models

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let plan: String
}

struct MoodEntry: Codable, Identifiable {
    let id: String
    let score: Int
    let emotions: [String]
    let note: String?
    let createdAt: String
    let aiSuggestion: String?

    enum CodingKeys: String, CodingKey {
        case id, score, emotions, note
        case createdAt = "created_at"
        case aiSuggestion = "ai_suggestion"
    }
}

struct ChatMessage: Identifiable {
    let id = UUID()
    let role: Role
    let content: String
    let timestamp: Date

    enum Role { case user, ai }
}

// MARK: - API Service

class APIService {
    static let shared = APIService()
    private let baseURL = "https://api.mindwell.app/v1"
    private var token: String?

    func setToken(_ token: String) { self.token = token }

    private func request(_ path: String, method: String = "GET", body: Data? = nil) async throws -> Data {
        var req = URLRequest(url: URL(string: "\(baseURL)\(path)")!)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        req.httpBody = body
        let (data, response) = try await URLSession.shared.data(for: req)
        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            throw URLError(.badServerResponse)
        }
        return data
    }

    func login(email: String, password: String) async throws -> String {
        let body = try JSONEncoder().encode(["email": email, "password": password])
        let data = try await request("/auth/login", method: "POST", body: body)
        let result = try JSONDecoder().decode([String: String].self, from: data)
        guard let token = result["token"] else { throw URLError(.cannotParseResponse) }
        self.token = token
        return token
    }

    func fetchMoodHistory(from: String, to: String) async throws -> [MoodEntry] {
        let data = try await request("/mood?from=\(from)&to=\(to)")
        return try JSONDecoder().decode([MoodEntry].self, from: data)
    }

    func logMood(score: Int, emotions: [String], note: String?) async throws -> MoodEntry {
        let payload: [String: Any] = ["score": score, "emotions": emotions, "note": note ?? ""]
        let body = try JSONSerialization.data(withJSONObject: payload)
        let data = try await request("/mood", method: "POST", body: body)
        return try JSONDecoder().decode(MoodEntry.self, from: data)
    }

    func sendChatMessage(_ message: String, sessionId: String) async throws -> String {
        let payload = ["message": message, "session_id": sessionId]
        let body = try JSONEncoder().encode(payload)
        let data = try await request("/chat", method: "POST", body: body)
        let result = try JSONDecoder().decode([String: String].self, from: data)
        return result["response"] ?? ""
    }
}

// MARK: - Auth ViewModel

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let token = try await APIService.shared.login(email: email, password: password)
            APIService.shared.setToken(token)
            isAuthenticated = true
        } catch {
            errorMessage = "Innlogging feilet. Sjekk e-post og passord."
        }
        isLoading = false
    }
}

// MARK: - Dashboard ViewModel

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var moodEntries: [MoodEntry] = []
    @Published var todayMood: Int?

    func loadMoodHistory() async {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let to = formatter.string(from: Date())
        let from = formatter.string(from: Calendar.current.date(byAdding: .day, value: -30, to: Date())!)
        do {
            moodEntries = try await APIService.shared.fetchMoodHistory(from: from, to: to)
            todayMood = moodEntries.last?.score
        } catch {
            print("Feil ved lasting av humørdata: \(error)")
        }
    }

    func logMood(score: Int, emotions: [String], note: String?) async {
        do {
            let entry = try await APIService.shared.logMood(score: score, emotions: emotions, note: note)
            moodEntries.append(entry)
            todayMood = score
        } catch {
            print("Feil ved logging av humør: \(error)")
        }
    }
}

// MARK: - Views

struct LoginView: View {
    @ObservedObject var authVM: AuthViewModel
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()
                Image(systemName: "brain.head.profile")
                    .font(.system(size: 64))
                    .foregroundStyle(.blue)
                Text("MindWell")
                    .font(.largeTitle.bold())
                Text("Din lomme-terapeut")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                VStack(spacing: 16) {
                    TextField("E-post", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)
                    SecureField("Passord", text: $password)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.password)
                }
                .padding(.horizontal, 32)

                if let error = authVM.errorMessage {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.caption)
                }

                Button {
                    Task { await authVM.login(email: email, password: password) }
                } label: {
                    if authVM.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Logg inn")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .padding(.horizontal, 32)
                .disabled(email.isEmpty || password.isEmpty)

                Spacer()
            }
            .accessibilityElement(children: .contain)
        }
    }
}

struct MoodTrackerView: View {
    @ObservedObject var vm: DashboardViewModel
    @State private var score: Double = 5
    @State private var selectedEmotions: Set<String> = []
    @State private var note = ""
    @Environment(\.dismiss) private var dismiss

    let emotions = ["Glad", "Rolig", "Engstelig", "Trist", "Irritert", "Håpefull", "Sliten", "Motivert"]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    Text("Hvordan har du det?")
                        .font(.title2.bold())

                    Text("\(Int(score))")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundStyle(moodColor)

                    Slider(value: $score, in: 1...10, step: 1)
                        .tint(moodColor)
                        .padding(.horizontal)
                        .accessibilityLabel("Humørscore fra 1 til 10")

                    FlowLayout(spacing: 8) {
                        ForEach(emotions, id: \.self) { emotion in
                            Button(emotion) {
                                if selectedEmotions.contains(emotion) {
                                    selectedEmotions.remove(emotion)
                                } else {
                                    selectedEmotions.insert(emotion)
                                }
                            }
                            .buttonStyle(.bordered)
                            .tint(selectedEmotions.contains(emotion) ? .blue : .gray)
                        }
                    }

                    TextField("Noe du vil notere?", text: $note, axis: .vertical)
                        .textFieldStyle(.roundedBorder)
                        .lineLimit(3...6)
                        .padding(.horizontal)

                    Button("Lagre") {
                        Task {
                            await vm.logMood(score: Int(score), emotions: Array(selectedEmotions), note: note.isEmpty ? nil : note)
                            dismiss()
                        }
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding()
            }
            .navigationTitle("Humørsjekk")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var moodColor: Color {
        switch Int(score) {
        case 1...3: return .red
        case 4...6: return .orange
        case 7...8: return .green
        default: return .blue
        }
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > maxWidth {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
        }
        return CGSize(width: maxWidth, height: currentY + lineHeight)
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var currentX: CGFloat = bounds.minX
        var currentY: CGFloat = bounds.minY
        var lineHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > bounds.maxX {
                currentX = bounds.minX
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            subview.place(at: CGPoint(x: currentX, y: currentY), proposal: .unspecified)
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
        }
    }
}

// Dashboard with mood chart and quick actions
struct DashboardView: View {
    @StateObject private var vm = DashboardViewModel()
    @State private var showMoodTracker = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Hei! 👋")
                            .font(.title.bold())
                        Text("Hvordan har du det i dag?")
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                .padding(.horizontal)

                if let todayMood = vm.todayMood {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(.blue.opacity(0.1))
                        .frame(height: 100)
                        .overlay {
                            VStack {
                                Text("Dagens humør")
                                    .font(.caption)
                                Text("\(todayMood)/10")
                                    .font(.title.bold())
                            }
                        }
                        .padding(.horizontal)
                } else {
                    Button { showMoodTracker = true } label: {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(.blue.opacity(0.1))
                            .frame(height: 100)
                            .overlay {
                                VStack {
                                    Image(systemName: "plus.circle")
                                        .font(.title)
                                    Text("Logg dagens humør")
                                }
                                .foregroundStyle(.blue)
                            }
                    }
                    .padding(.horizontal)
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Siste 7 dager")
                        .font(.headline)
                        .padding(.horizontal)
                    HStack(alignment: .bottom, spacing: 8) {
                        ForEach(vm.moodEntries.suffix(7)) { entry in
                            VStack {
                                Text("\(entry.score)")
                                    .font(.caption2)
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(.blue)
                                    .frame(width: 32, height: CGFloat(entry.score) * 8)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    QuickActionCard(icon: "bubble.left.fill", title: "AI-Terapeut", color: .blue)
                    QuickActionCard(icon: "wind", title: "Pusteøvelse", color: .green)
                    QuickActionCard(icon: "book.fill", title: "Journaling", color: .purple)
                    QuickActionCard(icon: "phone.fill", title: "Kriselinje", color: .red)
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .sheet(isPresented: $showMoodTracker) {
            MoodTrackerView(vm: vm)
        }
        .task { await vm.loadMoodHistory() }
    }
}

struct QuickActionCard: View {
    let icon: String
    let title: String
    let color: Color

    var body: some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(color.opacity(0.1))
            .frame(height: 100)
            .overlay {
                VStack(spacing: 8) {
                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundStyle(color)
                    Text(title)
                        .font(.subheadline.bold())
                }
            }
            .accessibilityElement(children: .combine)
    }
}

// Main tab navigation
struct MainTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Hjem", systemImage: "house.fill") }
            Text("Chat")
                .tabItem { Label("Terapeut", systemImage: "bubble.left.fill") }
            Text("Øvelser")
                .tabItem { Label("Øvelser", systemImage: "figure.mind.and.body") }
            Text("Profil")
                .tabItem { Label("Profil", systemImage: "person.fill") }
        }
        .tint(Color(hex: "4A90D9"))
    }
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(
            red: Double((rgb >> 16) & 0xFF) / 255,
            green: Double((rgb >> 8) & 0xFF) / 255,
            blue: Double(rgb & 0xFF) / 255
        )
    }
}

// App entry point — shows login or main app based on auth state
@main
struct MindWellApp: App {
    @StateObject private var authVM = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            if authVM.isAuthenticated {
                MainTabView()
            } else {
                LoginView(authVM: authVM)
            }
        }
    }
}
