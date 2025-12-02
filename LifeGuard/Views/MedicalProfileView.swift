import SwiftUI

struct MedicalProfileView: View {
    @EnvironmentObject var medicalProfile: MedicalProfileManager
    @State private var isEditing = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Personal Information")) {
                    HStack {
                        Text("Full Name")
                        Spacer()
                        if isEditing {
                            TextField("Enter name", text: $medicalProfile.profile.fullName)
                                .multilineTextAlignment(.trailing)
                        } else {
                            Text(medicalProfile.profile.fullName.isEmpty ? "Not set" : medicalProfile.profile.fullName)
                                .foregroundColor(.secondary)
                        }
                    }

                    DatePicker("Date of Birth", selection: $medicalProfile.profile.dateOfBirth, displayedComponents: .date)
                        .disabled(!isEditing)
                }

                Section(header: Text("Medical Information")) {
                    if isEditing {
                        Picker("Blood Type", selection: $medicalProfile.profile.bloodType) {
                            ForEach(["Unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], id: \.self) { type in
                                Text(type).tag(type)
                            }
                        }
                    } else {
                        HStack {
                            Text("Blood Type")
                            Spacer()
                            Text(medicalProfile.profile.bloodType)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                Section(header: Text("Allergies")) {
                    if medicalProfile.profile.allergies.isEmpty && !isEditing {
                        Text("No allergies recorded")
                            .foregroundColor(.secondary)
                    }
                    ForEach(medicalProfile.profile.allergies.indices, id: \.self) { index in
                        if isEditing {
                            TextField("Allergy", text: $medicalProfile.profile.allergies[index])
                        } else {
                            HStack {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.red)
                                Text(medicalProfile.profile.allergies[index])
                            }
                        }
                    }
                    .onDelete(perform: isEditing ? deleteAllergy : nil)

                    if isEditing {
                        Button(action: {
                            medicalProfile.profile.allergies.append("")
                        }) {
                            Label("Add Allergy", systemImage: "plus.circle.fill")
                        }
                    }
                }

                Section(header: Text("Current Medications")) {
                    if medicalProfile.profile.medications.isEmpty && !isEditing {
                        Text("No medications recorded")
                            .foregroundColor(.secondary)
                    }
                    ForEach(medicalProfile.profile.medications.indices, id: \.self) { index in
                        if isEditing {
                            TextField("Medication", text: $medicalProfile.profile.medications[index])
                        } else {
                            HStack {
                                Image(systemName: "pills.fill")
                                    .foregroundColor(.blue)
                                Text(medicalProfile.profile.medications[index])
                            }
                        }
                    }
                    .onDelete(perform: isEditing ? deleteMedication : nil)

                    if isEditing {
                        Button(action: {
                            medicalProfile.profile.medications.append("")
                        }) {
                            Label("Add Medication", systemImage: "plus.circle.fill")
                        }
                    }
                }

                Section(header: Text("Medical Conditions")) {
                    if medicalProfile.profile.medicalConditions.isEmpty && !isEditing {
                        Text("No conditions recorded")
                            .foregroundColor(.secondary)
                    }
                    ForEach(medicalProfile.profile.medicalConditions.indices, id: \.self) { index in
                        if isEditing {
                            TextField("Condition", text: $medicalProfile.profile.medicalConditions[index])
                        } else {
                            HStack {
                                Image(systemName: "cross.fill")
                                    .foregroundColor(.purple)
                                Text(medicalProfile.profile.medicalConditions[index])
                            }
                        }
                    }
                    .onDelete(perform: isEditing ? deleteCondition : nil)

                    if isEditing {
                        Button(action: {
                            medicalProfile.profile.medicalConditions.append("")
                        }) {
                            Label("Add Condition", systemImage: "plus.circle.fill")
                        }
                    }
                }

                Section(header: Text("Emergency Contacts")) {
                    if medicalProfile.profile.emergencyContacts.isEmpty && !isEditing {
                        Text("No emergency contacts")
                            .foregroundColor(.secondary)
                    }
                    ForEach(medicalProfile.profile.emergencyContacts) { contact in
                        if isEditing {
                            NavigationLink(destination: EmergencyContactEditView(contact: binding(for: contact))) {
                                VStack(alignment: .leading) {
                                    Text(contact.name.isEmpty ? "New Contact" : contact.name)
                                        .font(.headline)
                                    Text(contact.phoneNumber.isEmpty ? "No number" : contact.phoneNumber)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                            }
                        } else {
                            VStack(alignment: .leading) {
                                Text(contact.name)
                                    .font(.headline)
                                HStack {
                                    Text(contact.relationship)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                    Spacer()
                                    Text(contact.phoneNumber)
                                        .font(.subheadline)
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                    }
                    .onDelete(perform: isEditing ? deleteContact : nil)

                    if isEditing {
                        Button(action: {
                            let newContact = EmergencyContact(name: "", relationship: "", phoneNumber: "")
                            medicalProfile.profile.emergencyContacts.append(newContact)
                        }) {
                            Label("Add Emergency Contact", systemImage: "plus.circle.fill")
                        }
                    }
                }
            }
            .navigationTitle("Medical Profile")
            .navigationBarItems(trailing: Button(isEditing ? "Done" : "Edit") {
                isEditing.toggle()
            })
        }
    }

    private func binding(for contact: EmergencyContact) -> Binding<EmergencyContact> {
        guard let index = medicalProfile.profile.emergencyContacts.firstIndex(where: { $0.id == contact.id }) else {
            fatalError("Contact not found")
        }
        return $medicalProfile.profile.emergencyContacts[index]
    }

    private func deleteAllergy(at offsets: IndexSet) {
        medicalProfile.profile.allergies.remove(atOffsets: offsets)
    }

    private func deleteMedication(at offsets: IndexSet) {
        medicalProfile.profile.medications.remove(atOffsets: offsets)
    }

    private func deleteCondition(at offsets: IndexSet) {
        medicalProfile.profile.medicalConditions.remove(atOffsets: offsets)
    }

    private func deleteContact(at offsets: IndexSet) {
        medicalProfile.profile.emergencyContacts.remove(atOffsets: offsets)
    }
}

struct EmergencyContactEditView: View {
    @Binding var contact: EmergencyContact

    var body: some View {
        Form {
            Section(header: Text("Contact Information")) {
                TextField("Name", text: $contact.name)
                TextField("Relationship", text: $contact.relationship)
                TextField("Phone Number", text: $contact.phoneNumber)
                    .keyboardType(.phonePad)
            }
        }
        .navigationTitle("Edit Contact")
    }
}

#Preview {
    MedicalProfileView()
        .environmentObject(MedicalProfileManager())
}
