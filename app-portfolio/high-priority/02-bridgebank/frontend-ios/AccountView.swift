// BridgeBank iOS — Kontovisning med saldo, transaksjoner og hurtighandlinger
import SwiftUI

struct Account: Codable {
    let id: String
    let accountNumber: String
    let balance: Double
    let currency: String
    let tier: String
}

struct Transaction: Codable, Identifiable {
    let id: String
    let amount: Double
    let type: String
    let description: String
    let date: String
    let counterparty: String?
}

class BridgeBankAPI: ObservableObject {
    static let shared = BridgeBankAPI()
    private let baseURL = "https://api.bridgebank.app/v1"
    var token: String?

    func fetchAccount() async throws -> Account {
        try await get("/accounts/me")
    }

    func fetchTransactions() async throws -> [Transaction] {
        try await get("/transfers/history")
    }

    func sendMoney(to phone: String, amount: Double) async throws -> Transaction {
        let body = try JSONEncoder().encode(["phone": phone, "amount": "\(amount)"])
        return try await post("/transfers/p2p", body: body)
    }

    private func get<T: Decodable>(_ path: String) async throws -> T {
        var req = URLRequest(url: URL(string: "\(baseURL)\(path)")!)
        req.setValue("Bearer \(token ?? "")", forHTTPHeaderField: "Authorization")
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(T.self, from: data)
    }

    private func post<T: Decodable>(_ path: String, body: Data) async throws -> T {
        var req = URLRequest(url: URL(string: "\(baseURL)\(path)")!)
        req.httpMethod = "POST"
        req.httpBody = body
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token ?? "")", forHTTPHeaderField: "Authorization")
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(T.self, from: data)
    }
}

struct AccountView: View {
    @StateObject private var api = BridgeBankAPI.shared
    @State private var account: Account?
    @State private var transactions: [Transaction] = []
    @State private var showSend = false
    @State private var isLoading = true

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    balanceCard
                    quickActions
                    transactionList
                }
                .padding()
            }
            .background(Color(hex: "FFFBEB"))
            .navigationTitle("BridgeBank")
            .task { await loadData() }
            .sheet(isPresented: $showSend) {
                SendMoneyView()
            }
        }
    }

    private var balanceCard: some View {
        VStack(spacing: 8) {
            Text("Din saldo")
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.8))
            if let account = account {
                Text("\(account.currency) \(String(format: "%.2f", account.balance))")
                    .font(.system(size: 36, weight: .bold))
                    .foregroundColor(.white)
                Text("Konto: \(account.accountNumber)")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
            } else {
                ProgressView().tint(.white)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .background(
            LinearGradient(colors: [Color(hex: "0D9488"), Color(hex: "065F46")], startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .cornerRadius(20)
    }

    private var quickActions: some View {
        HStack(spacing: 16) {
            ActionButton(icon: "arrow.up.circle.fill", title: "Send", color: .teal) { showSend = true }
            ActionButton(icon: "arrow.down.circle.fill", title: "Motta", color: .green) { }
            ActionButton(icon: "banknote.fill", title: "Spare", color: .amber) { }
            ActionButton(icon: "mappin.circle.fill", title: "Agent", color: .blue) { }
        }
    }

    private var transactionList: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Siste transaksjoner")
                .font(.headline)
            ForEach(transactions.prefix(10)) { txn in
                HStack {
                    Circle()
                        .fill(txn.amount > 0 ? Color.green.opacity(0.15) : Color.red.opacity(0.15))
                        .frame(width: 40, height: 40)
                        .overlay(
                            Image(systemName: txn.amount > 0 ? "arrow.down" : "arrow.up")
                                .foregroundColor(txn.amount > 0 ? .green : .red)
                        )
                    VStack(alignment: .leading) {
                        Text(txn.description)
                            .font(.body)
                        Text(txn.date)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Text("\(txn.amount > 0 ? "+" : "")\(String(format: "%.2f", txn.amount))")
                        .font(.body.bold())
                        .foregroundColor(txn.amount > 0 ? .green : .primary)
                }
                .padding(.vertical, 4)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }

    private func loadData() async {
        do {
            async let a = api.fetchAccount()
            async let t = api.fetchTransactions()
            account = try await a
            transactions = try await t
        } catch {
            account = Account(id: "demo", accountNumber: "BB-1234-5678", balance: 12450.00, currency: "KES", tier: "basic")
            transactions = [
                Transaction(id: "1", amount: -500, type: "p2p", description: "Sendt til Amina", date: "2026-02-23", counterparty: "+254712345678"),
                Transaction(id: "2", amount: 2000, type: "agent_deposit", description: "Innskudd via agent", date: "2026-02-22", counterparty: "Agent Mwangi"),
                Transaction(id: "3", amount: -150, type: "purchase", description: "Safaricom airtime", date: "2026-02-21", counterparty: nil),
            ]
        }
        isLoading = false
    }
}

struct ActionButton: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                Text(title)
                    .font(.caption)
                    .foregroundColor(.primary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color.white)
            .cornerRadius(12)
        }
    }
}

struct SendMoneyView: View {
    @State private var phone = ""
    @State private var amount = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Mottaker") {
                    TextField("Telefonnummer", text: $phone)
                        .keyboardType(.phonePad)
                }
                Section("Beløp") {
                    TextField("0.00", text: $amount)
                        .keyboardType(.decimalPad)
                }
                Section {
                    Button("Send penger") { dismiss() }
                        .disabled(phone.isEmpty || amount.isEmpty)
                }
            }
            .navigationTitle("Send penger")
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Avbryt") { dismiss() } } }
        }
    }
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(red: Double((rgb >> 16) & 0xFF) / 255, green: Double((rgb >> 8) & 0xFF) / 255, blue: Double(rgb & 0xFF) / 255)
    }
    static let amber = Color(hex: "F59E0B")
}
