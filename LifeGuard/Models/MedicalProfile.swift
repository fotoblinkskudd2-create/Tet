import Foundation

struct MedicalProfile: Codable {
    var fullName: String
    var dateOfBirth: Date
    var bloodType: String
    var allergies: [String]
    var medications: [String]
    var medicalConditions: [String]
    var emergencyContacts: [EmergencyContact]

    init() {
        self.fullName = ""
        self.dateOfBirth = Date()
        self.bloodType = "Unknown"
        self.allergies = []
        self.medications = []
        self.medicalConditions = []
        self.emergencyContacts = []
    }
}

struct EmergencyContact: Codable, Identifiable {
    var id = UUID()
    var name: String
    var relationship: String
    var phoneNumber: String
}

class MedicalProfileManager: ObservableObject {
    @Published var profile: MedicalProfile {
        didSet {
            saveProfile()
        }
    }

    private let profileKey = "medicalProfile"

    init() {
        if let data = UserDefaults.standard.data(forKey: profileKey),
           let decoded = try? JSONDecoder().decode(MedicalProfile.self, from: data) {
            self.profile = decoded
        } else {
            self.profile = MedicalProfile()
        }
    }

    private func saveProfile() {
        if let encoded = try? JSONEncoder().encode(profile) {
            UserDefaults.standard.set(encoded, forKey: profileKey)
        }
    }
}
