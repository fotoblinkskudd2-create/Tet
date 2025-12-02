import SwiftUI

struct EmergencySOSView: View {
    @EnvironmentObject var medicalProfile: MedicalProfileManager
    @EnvironmentObject var locationManager: LocationManager
    @State private var showingCallConfirmation = false
    @State private var selectedEmergencyNumber = ""
    @State private var countdown = 0
    @State private var timer: Timer?

    var body: some View {
        NavigationView {
            ZStack {
                LinearGradient(
                    gradient: Gradient(colors: [Color.red.opacity(0.3), Color.orange.opacity(0.2)]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 30) {
                        // Main SOS Button
                        VStack(spacing: 20) {
                            Image(systemName: "sos.circle.fill")
                                .font(.system(size: 80))
                                .foregroundColor(.red)

                            Text("EMERGENCY SOS")
                                .font(.title)
                                .fontWeight(.bold)

                            Button(action: {
                                selectedEmergencyNumber = "911"
                                startCountdown()
                            }) {
                                Text("CALL 911")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 70)
                                    .background(Color.red)
                                    .cornerRadius(15)
                                    .shadow(radius: 5)
                            }
                            .padding(.horizontal)

                            if countdown > 0 {
                                Text("Calling in \(countdown)...")
                                    .font(.headline)
                                    .foregroundColor(.red)

                                Button("Cancel") {
                                    cancelCountdown()
                                }
                                .foregroundColor(.red)
                                .padding()
                            }

                            Text("Hold to call immediately")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding()

                        // Quick Emergency Contacts
                        VStack(alignment: .leading, spacing: 15) {
                            Text("Emergency Contacts")
                                .font(.headline)
                                .padding(.horizontal)

                            if medicalProfile.profile.emergencyContacts.isEmpty {
                                Text("No emergency contacts added. Add them in Medical Info tab.")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                                    .padding()
                            } else {
                                ForEach(medicalProfile.profile.emergencyContacts) { contact in
                                    Button(action: {
                                        callNumber(contact.phoneNumber)
                                    }) {
                                        HStack {
                                            Image(systemName: "phone.circle.fill")
                                                .font(.title2)
                                                .foregroundColor(.blue)

                                            VStack(alignment: .leading) {
                                                Text(contact.name)
                                                    .font(.headline)
                                                    .foregroundColor(.primary)
                                                Text(contact.relationship)
                                                    .font(.subheadline)
                                                    .foregroundColor(.secondary)
                                            }

                                            Spacer()

                                            Text(contact.phoneNumber)
                                                .font(.subheadline)
                                                .foregroundColor(.blue)
                                        }
                                        .padding()
                                        .background(Color.white)
                                        .cornerRadius(10)
                                        .shadow(radius: 2)
                                    }
                                    .padding(.horizontal)
                                }
                            }
                        }

                        // Important Medical Info Quick View
                        if !medicalProfile.profile.fullName.isEmpty {
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Quick Medical Info")
                                    .font(.headline)
                                    .padding(.horizontal)

                                VStack(alignment: .leading, spacing: 8) {
                                    InfoRow(title: "Blood Type", value: medicalProfile.profile.bloodType)

                                    if !medicalProfile.profile.allergies.isEmpty {
                                        InfoRow(title: "Allergies", value: medicalProfile.profile.allergies.joined(separator: ", "))
                                            .foregroundColor(.red)
                                    }

                                    if !medicalProfile.profile.medicalConditions.isEmpty {
                                        InfoRow(title: "Conditions", value: medicalProfile.profile.medicalConditions.joined(separator: ", "))
                                    }
                                }
                                .padding()
                                .background(Color.white)
                                .cornerRadius(10)
                                .shadow(radius: 2)
                                .padding(.horizontal)
                            }
                        }

                        // International Emergency Numbers
                        VStack(alignment: .leading, spacing: 15) {
                            Text("International Emergency Numbers")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(internationalNumbers, id: \.country) { emergency in
                                Button(action: {
                                    selectedEmergencyNumber = emergency.number
                                    callNumber(emergency.number)
                                }) {
                                    HStack {
                                        Text(emergency.flag)
                                            .font(.title)
                                        VStack(alignment: .leading) {
                                            Text(emergency.country)
                                                .font(.headline)
                                                .foregroundColor(.primary)
                                            Text(emergency.number)
                                                .font(.subheadline)
                                                .foregroundColor(.secondary)
                                        }
                                        Spacer()
                                        Image(systemName: "phone.fill")
                                            .foregroundColor(.green)
                                    }
                                    .padding()
                                    .background(Color.white)
                                    .cornerRadius(10)
                                    .shadow(radius: 2)
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Emergency SOS")
        }
    }

    private func startCountdown() {
        countdown = 3
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            if countdown > 0 {
                countdown -= 1
            } else {
                callNumber(selectedEmergencyNumber)
                timer?.invalidate()
            }
        }
    }

    private func cancelCountdown() {
        timer?.invalidate()
        countdown = 0
    }

    private func callNumber(_ number: String) {
        let cleanNumber = number.replacingOccurrences(of: " ", with: "")
            .replacingOccurrences(of: "-", with: "")
            .replacingOccurrences(of: "(", with: "")
            .replacingOccurrences(of: ")", with: "")

        if let url = URL(string: "tel://\(cleanNumber)") {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            }
        }
        cancelCountdown()
    }

    private let internationalNumbers = [
        (country: "United States", number: "911", flag: "🇺🇸"),
        (country: "United Kingdom", number: "999", flag: "🇬🇧"),
        (country: "European Union", number: "112", flag: "🇪🇺"),
        (country: "Australia", number: "000", flag: "🇦🇺"),
        (country: "Canada", number: "911", flag: "🇨🇦"),
        (country: "Japan", number: "119", flag: "🇯🇵"),
        (country: "China", number: "120", flag: "🇨🇳"),
        (country: "India", number: "112", flag: "🇮🇳")
    ]
}

struct InfoRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(title + ":")
                .font(.subheadline)
                .fontWeight(.semibold)
            Text(value)
                .font(.subheadline)
        }
    }
}

#Preview {
    EmergencySOSView()
        .environmentObject(MedicalProfileManager())
        .environmentObject(LocationManager())
}
