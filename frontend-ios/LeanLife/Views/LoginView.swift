import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var isRegister = false
    @State private var name = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    // Logo
                    VStack(spacing: 8) {
                        Image(systemName: "leaf.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.green)
                        Text("LeanLife")
                            .font(.largeTitle).bold()
                            .foregroundStyle(.green)
                        Text("Din personlige vei til varig, sunn vekt")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 60)

                    // Form
                    VStack(spacing: 16) {
                        if isRegister {
                            TextField("Navn", text: $name)
                                .textFieldStyle(.roundedBorder)
                                .textContentType(.name)
                        }

                        TextField("E-post", text: $email)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                        SecureField("Passord", text: $password)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(isRegister ? .newPassword : .password)

                        if let error = authVM.error {
                            Text(error)
                                .font(.caption)
                                .foregroundStyle(.red)
                        }

                        Button(action: submit) {
                            if authVM.isLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text(isRegister ? "Opprett konto" : "Logg inn")
                                    .font(.headline)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(.green)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .disabled(authVM.isLoading)

                        Button(isRegister ? "Har du konto? Logg inn" : "Ny bruker? Registrer deg") {
                            withAnimation { isRegister.toggle() }
                        }
                        .font(.subheadline)
                        .foregroundStyle(.green)
                    }
                    .padding(.horizontal, 24)
                }
            }
        }
    }

    private func submit() {
        Task {
            if isRegister {
                await authVM.register(name: name, email: email, password: password)
            } else {
                await authVM.login(email: email, password: password)
            }
        }
    }
}
