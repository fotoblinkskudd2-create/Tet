// MediWise iOS — Medisinliste, påminnelser, interaksjonssjekk og pillegjenkjenning
import SwiftUI

// MARK: - Models

struct Medication: Codable, Identifiable {
    let id: String
    let name: String
    let dosage: String
    let frequency: String
    let instructions: String?
    let active: Bool
}

struct Reminder: Codable, Identifiable {
    let id: String
    let medicationId: String
    let medicationName: String
    let scheduledAt: String
    let confirmedAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case medicationId = "medication_id"
        case medicationName = "medication_name"
        case scheduledAt = "scheduled_at"
        case confirmedAt = "confirmed_at"
    }

    var isPending: Bool { confirmedAt == nil }
}

struct InteractionResult: Codable {
    let severity: String
    let description: String
    let recommendation: String
}

struct PillIdentification: Codable {
    let name: String
    let dosage: String
    let confidence: Double
    let description: String
}

// MARK: - API

class MediWiseAPI {
    static let shared = MediWiseAPI()
    private let baseURL = "https://api.mediwise.app/v1"

    private func authRequest(_ path: String, method: String = "GET", body: Data? = nil) async throws -> Data {
        var req = URLRequest(url: URL(string: "\(baseURL)\(path)")!)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = UserDefaults.standard.string(forKey: "mw_token") {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        req.httpBody = body
        let (data, _) = try await URLSession.shared.data(for: req)
        return data
    }

    func fetchMedications() async throws -> [Medication] {
        let data = try await authRequest("/medications")
        return try JSONDecoder().decode([Medication].self, from: data)
    }

    func addMedication(name: String, dosage: String, frequency: String, instructions: String?) async throws -> Medication {
        let body = try JSONEncoder().encode(["name": name, "dosage": dosage, "frequency": frequency, "instructions": instructions ?? ""])
        let data = try await authRequest("/medications", method: "POST", body: body)
        return try JSONDecoder().decode(Medication.self, from: data)
    }

    func fetchReminders() async throws -> [Reminder] {
        let data = try await authRequest("/reminders")
        return try JSONDecoder().decode([Reminder].self, from: data)
    }

    func confirmReminder(id: String) async throws {
        _ = try await authRequest("/reminders/\(id)/confirm", method: "PUT")
    }

    func checkInteractions(medicationIds: [String]) async throws -> [InteractionResult] {
        let body = try JSONEncoder().encode(["medication_ids": medicationIds])
        let data = try await authRequest("/medications/interactions", method: "POST", body: body)
        return try JSONDecoder().decode([InteractionResult].self, from: data)
    }
}

// MARK: - ViewModel

@MainActor
class MedicationsViewModel: ObservableObject {
    @Published var medications: [Medication] = []
    @Published var reminders: [Reminder] = []
    @Published var interactions: [InteractionResult] = []
    @Published var isLoading = false

    func load() async {
        isLoading = true
        do {
            async let m = MediWiseAPI.shared.fetchMedications()
            async let r = MediWiseAPI.shared.fetchReminders()
            medications = try await m
            reminders = try await r

            if medications.count >= 2 {
                interactions = try await MediWiseAPI.shared.checkInteractions(
                    medicationIds: medications.map(\.id)
                )
            }
        } catch {
            print("Load error: \(error)")
        }
        isLoading = false
    }

    func confirmReminder(_ id: String) async {
        try? await MediWiseAPI.shared.confirmReminder(id: id)
        if let idx = reminders.firstIndex(where: { $0.id == id }) {
            reminders.remove(at: idx)
        }
    }

    func addMedication(name: String, dosage: String, frequency: String, instructions: String?) async {
        do {
            let med = try await MediWiseAPI.shared.addMedication(
                name: name, dosage: dosage, frequency: frequency, instructions: instructions
            )
            medications.append(med)
        } catch {
            print("Add error: \(error)")
        }
    }
}

// MARK: - Views

struct MedicationsHomeView: View {
    @StateObject private var vm = MedicationsViewModel()
    @State private var showAddSheet = false

    var pendingReminders: [Reminder] {
        reminders.filter(\.isPending)
    }
    var reminders: [Reminder] { vm.reminders }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    if !pendingReminders.isEmpty {
                        NextDoseCard(reminders: pendingReminders, onConfirm: { id in
                            Task { await vm.confirmReminder(id) }
                        })
                    }

                    if !vm.interactions.isEmpty {
                        InteractionAlerts(interactions: vm.interactions)
                    }

                    MedicationsList(medications: vm.medications)
                }
                .padding()
            }
            .navigationTitle("MediWise")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showAddSheet = true } label: {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
            .sheet(isPresented: $showAddSheet) {
                AddMedicationSheet(vm: vm)
            }
            .task { await vm.load() }
        }
    }
}

struct NextDoseCard: View {
    let reminders: [Reminder]
    let onConfirm: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Neste dose")
                .font(.headline)
            ForEach(reminders) { reminder in
                HStack {
                    VStack(alignment: .leading) {
                        Text(reminder.medicationName)
                            .font(.subheadline.bold())
                        Text(formatTime(reminder.scheduledAt))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Button {
                        onConfirm(reminder.id)
                    } label: {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.title)
                            .foregroundStyle(.green)
                    }
                    .accessibilityLabel("Bekreft at du har tatt \(reminder.medicationName)")
                }
                .padding()
                .background(Color.blue.opacity(0.05))
                .cornerRadius(12)
            }
        }
    }

    private func formatTime(_ iso: String) -> String {
        let f = ISO8601DateFormatter()
        guard let date = f.date(from: iso) else { return iso }
        let tf = DateFormatter()
        tf.timeStyle = .short
        tf.locale = Locale(identifier: "nb_NO")
        return tf.string(from: date)
    }
}

struct InteractionAlerts: View {
    let interactions: [InteractionResult]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundStyle(.orange)
                Text("Interaksjoner oppdaget")
                    .font(.headline)
            }
            ForEach(Array(interactions.enumerated()), id: \.offset) { _, interaction in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Circle()
                            .fill(interaction.severity == "severe" ? .red : .orange)
                            .frame(width: 8, height: 8)
                        Text(interaction.severity.capitalized)
                            .font(.caption.bold())
                            .foregroundStyle(interaction.severity == "severe" ? .red : .orange)
                    }
                    Text(interaction.description)
                        .font(.subheadline)
                    Text(interaction.recommendation)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(interaction.severity == "severe" ? Color.red.opacity(0.05) : Color.orange.opacity(0.05))
                .cornerRadius(12)
            }
        }
    }
}

struct MedicationsList: View {
    let medications: [Medication]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Mine medisiner")
                .font(.headline)
            ForEach(medications) { med in
                HStack {
                    Image(systemName: "pill.fill")
                        .foregroundStyle(.blue)
                        .frame(width: 40, height: 40)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(10)
                    VStack(alignment: .leading) {
                        Text(med.name)
                            .font(.subheadline.bold())
                        Text("\(med.dosage) — \(med.frequency)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    if med.active {
                        Text("Aktiv")
                            .font(.caption2)
                            .foregroundStyle(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(8)
                    }
                }
                .padding()
                .background(.white)
                .cornerRadius(12)
                .shadow(color: .black.opacity(0.05), radius: 4)
            }
        }
    }
}

struct AddMedicationSheet: View {
    @ObservedObject var vm: MedicationsViewModel
    @State private var name = ""
    @State private var dosage = ""
    @State private var frequency = "1x daglig"
    @State private var instructions = ""
    @Environment(\.dismiss) private var dismiss

    let frequencies = ["1x daglig", "2x daglig", "3x daglig", "Ved behov", "Ukentlig"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Medisin") {
                    TextField("Navn (f.eks. Metformin)", text: $name)
                    TextField("Dosering (f.eks. 500mg)", text: $dosage)
                }
                Section("Frekvens") {
                    Picker("Frekvens", selection: $frequency) {
                        ForEach(frequencies, id: \.self) { Text($0) }
                    }
                }
                Section("Instruksjoner") {
                    TextField("F.eks. Ta med mat", text: $instructions)
                }
            }
            .navigationTitle("Ny medisin")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Avbryt") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Lagre") {
                        Task {
                            await vm.addMedication(
                                name: name, dosage: dosage,
                                frequency: frequency,
                                instructions: instructions.isEmpty ? nil : instructions
                            )
                            dismiss()
                        }
                    }
                    .disabled(name.isEmpty || dosage.isEmpty)
                }
            }
        }
    }
}

// Main tab
struct MediWiseTabView: View {
    var body: some View {
        TabView {
            MedicationsHomeView()
                .tabItem { Label("Hjem", systemImage: "house.fill") }
            Text("Kamera") // Placeholder for pill identification
                .tabItem { Label("Skann", systemImage: "camera.fill") }
            Text("Historikk") // Placeholder for adherence history
                .tabItem { Label("Historikk", systemImage: "calendar") }
            Text("Familie") // Placeholder for caregiver view
                .tabItem { Label("Familie", systemImage: "person.2.fill") }
        }
        .tint(Color(red: 0, green: 0.4, blue: 0.8))
    }
}
