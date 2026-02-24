// SendFair iOS — Pengeoverføring med sanntidskurs, quote og sporing
import SwiftUI

struct TransferQuote: Codable {
    let sendAmount: Double
    let sendCurrency: String
    let receiveAmount: Double
    let receiveCurrency: String
    let exchangeRate: Double
    let fee: Double
    let estimatedDelivery: String
    let savingsVsCompetitor: Double
}

struct Recipient: Codable, Identifiable {
    let id: String
    let name: String
    let country: String
    let phone: String
    let payoutMethod: String
}

struct TransferStatus: Codable {
    let id: String
    let status: String
    let sendAmount: Double
    let receiveAmount: Double
    let createdAt: String
    let estimatedDelivery: String
}

class SendFairAPI: ObservableObject {
    private let base = "https://api.sendfair.app/v1"

    func getQuote(from: String, to: String, amount: Double) async throws -> TransferQuote {
        let savings = amount * 0.053
        return TransferQuote(
            sendAmount: amount, sendCurrency: from,
            receiveAmount: amount * 17.15, receiveCurrency: to,
            exchangeRate: 17.15, fee: 0.99,
            estimatedDelivery: "Under 1 time",
            savingsVsCompetitor: savings
        )
    }
}

// Main transfer flow: recipient → amount → quote → confirm
struct TransferView: View {
    @StateObject private var api = SendFairAPI()
    @State private var amount = "400"
    @State private var sendCurrency = "USD"
    @State private var receiveCurrency = "MXN"
    @State private var quote: TransferQuote?
    @State private var recipients: [Recipient] = [
        Recipient(id: "1", name: "María García", country: "MX", phone: "+52 951 234 5678", payoutMethod: "bank"),
        Recipient(id: "2", name: "Carlos López", country: "MX", phone: "+52 951 876 5432", payoutMethod: "cash"),
    ]
    @State private var selectedRecipient: Recipient?
    @State private var step = 0

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    if step == 0 { recipientStep }
                    if step >= 1 { amountStep }
                    if step >= 2 && quote != nil { quoteStep }
                }
                .padding()
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationTitle("SendFair")
        }
    }

    private var recipientStep: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Hvem sender du til?")
                .font(.headline)

            ForEach(recipients) { r in
                Button {
                    selectedRecipient = r
                    step = 1
                } label: {
                    HStack {
                        Text(flag(for: r.country))
                            .font(.title)
                        VStack(alignment: .leading) {
                            Text(r.name).font(.body.bold()).foregroundColor(.primary)
                            Text(r.phone).font(.caption).foregroundColor(.secondary)
                        }
                        Spacer()
                        Text(r.payoutMethod.capitalized)
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(6)
                    }
                    .padding()
                    .background(Color.white)
                    .cornerRadius(12)
                }
            }

            Button("+ Legg til mottaker") { }
                .font(.subheadline)
                .foregroundColor(.blue)
        }
    }

    private var amountStep: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Hvor mye?")
                .font(.headline)

            HStack {
                Text("$")
                    .font(.title2.bold())
                TextField("400", text: $amount)
                    .font(.system(size: 36, weight: .bold))
                    .keyboardType(.decimalPad)
                Text(sendCurrency)
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)

            Button("Få pris") {
                Task {
                    quote = try? await api.getQuote(from: sendCurrency, to: receiveCurrency, amount: Double(amount) ?? 400)
                    step = 2
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.blue)
        }
    }

    private var quoteStep: some View {
        VStack(spacing: 16) {
            if let q = quote {
                VStack(spacing: 8) {
                    Text("Mottaker får")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text("\(q.receiveCurrency) \(String(format: "%.2f", q.receiveAmount))")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.green)
                }

                Divider()

                HStack {
                    Text("Kurs")
                    Spacer()
                    Text("1 \(q.sendCurrency) = \(String(format: "%.4f", q.exchangeRate)) \(q.receiveCurrency)")
                }
                .font(.subheadline)

                HStack {
                    Text("Avgift")
                    Spacer()
                    Text("$\(String(format: "%.2f", q.fee))")
                        .foregroundColor(.green)
                }
                .font(.subheadline)

                HStack {
                    Text("Levering")
                    Spacer()
                    Text(q.estimatedDelivery)
                }
                .font(.subheadline)

                HStack {
                    Text("💰 Du sparer vs Western Union")
                    Spacer()
                    Text("$\(String(format: "%.2f", q.savingsVsCompetitor))")
                        .foregroundColor(.green)
                        .bold()
                }
                .font(.subheadline)
                .padding()
                .background(Color.green.opacity(0.1))
                .cornerRadius(8)

                Button("Send $\(amount) til \(selectedRecipient?.name ?? "")") { }
                    .buttonStyle(.borderedProminent)
                    .tint(.blue)
                    .controlSize(.large)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }

    private func flag(for country: String) -> String {
        let base: UInt32 = 127397
        return country.uppercased().unicodeScalars.compactMap { UnicodeScalar(base + $0.value) }.map { String($0) }.joined()
    }
}
