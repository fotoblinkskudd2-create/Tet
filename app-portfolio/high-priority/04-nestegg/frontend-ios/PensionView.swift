// NestEgg iOS — Pensjonskalkulator, gap-analyse og spareplan
import SwiftUI
import Charts

struct PensionProfile: Codable {
    let currentAge: Int
    let retirementAge: Int
    let currentSavings: Double
    let monthlyIncome: Double
    let monthlyExpenses: Double
    let existingPensionAnnual: Double
    let country: String
}

struct GapAnalysis: Codable {
    let neededTotal: Double
    let currentProjected: Double
    let gap: Double
    let monthlySavingsNeeded: Double
    let yearsToRetirement: Int
}

struct SavingsProgress: Codable {
    let current: Double
    let target: Double
    let percentage: Double
    let monthlyContribution: Double
    let projectedAtRetirement: Double
}

class NestEggAPI: ObservableObject {
    private let base = "https://api.nestegg.app/v1"

    func calculateGap(profile: PensionProfile) async throws -> GapAnalysis {
        let yearsToRetirement = profile.retirementAge - profile.currentAge
        let yearsInRetirement = 25
        let annualNeed = profile.monthlyExpenses * 12 * 0.75
        let neededTotal = annualNeed * Double(yearsInRetirement) - profile.existingPensionAnnual * Double(yearsInRetirement)
        let projected = profile.currentSavings * pow(1.06, Double(yearsToRetirement))
        let gap = max(0, neededTotal - projected)
        let monthlyNeeded = gap / (Double(yearsToRetirement) * 12) / 1.4

        return GapAnalysis(
            neededTotal: neededTotal,
            currentProjected: projected,
            gap: gap,
            monthlySavingsNeeded: monthlyNeeded,
            yearsToRetirement: yearsToRetirement
        )
    }
}

// Main pension dashboard with gap visualization and savings tracker
struct PensionView: View {
    @StateObject private var api = NestEggAPI()
    @State private var gap: GapAnalysis?
    @State private var profile = PensionProfile(
        currentAge: 32, retirementAge: 67, currentSavings: 45000,
        monthlyIncome: 55000, monthlyExpenses: 35000,
        existingPensionAnnual: 180000, country: "NO"
    )

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    gapCard
                    savingsTracker
                    scenarioButtons
                    coachCard
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("NestEgg")
            .task {
                gap = try? await api.calculateGap(profile: profile)
            }
        }
    }

    private var gapCard: some View {
        VStack(spacing: 16) {
            Text("Ditt pensjonsgap")
                .font(.headline)
                .foregroundColor(.white)

            if let gap = gap {
                HStack(spacing: 30) {
                    VStack {
                        Text("Trenger")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                        Text("kr \(Int(gap.neededTotal / 1000))K")
                            .font(.title2.bold())
                            .foregroundColor(.white)
                    }
                    VStack {
                        Text("Har/projisert")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                        Text("kr \(Int(gap.currentProjected / 1000))K")
                            .font(.title2.bold())
                            .foregroundColor(.green)
                    }
                    VStack {
                        Text("Gap")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                        Text("kr \(Int(gap.gap / 1000))K")
                            .font(.title2.bold())
                            .foregroundColor(.red)
                    }
                }

                Divider().background(Color.white.opacity(0.3))

                Text("Spar kr \(Int(gap.monthlySavingsNeeded))/mnd for å lukke gapet")
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.9))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(LinearGradient(colors: [.indigo, .purple], startPoint: .topLeading, endPoint: .bottomTrailing))
        .cornerRadius(20)
    }

    private var savingsTracker: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Sparefremgang", systemImage: "chart.line.uptrend.xyaxis")
                .font(.headline)

            let pct = 45000.0 / (gap?.neededTotal ?? 1) * 100
            ProgressView(value: min(pct / 100, 1.0))
                .tint(.green)
                .scaleEffect(y: 2)

            Text("kr 45,000 / kr \(Int((gap?.neededTotal ?? 0) / 1000))K (\(Int(pct))%)")
                .font(.subheadline)
                .foregroundColor(.secondary)

            Text("\(gap?.yearsToRetirement ?? 35) år til pensjon")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }

    private var scenarioButtons: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Hva om...?")
                .font(.headline)
            HStack(spacing: 12) {
                ScenarioButton(title: "Pensjon ved 62", icon: "clock.arrow.circlepath")
                ScenarioButton(title: "Spar 2x mer", icon: "arrow.up.circle")
                ScenarioButton(title: "Børskrakk", icon: "chart.line.downtrend.xyaxis")
            }
        }
    }

    private var coachCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("AI Pensjonscoach", systemImage: "brain.head.profile")
                .font(.headline)
            Text("«Lisa, med kr 3,500/mnd ekstra i indeksfond lukker du pensjonsgapet innen 2057. Start med kr 1,000/mnd — det gjør en enorm forskjell.»")
                .font(.body)
                .foregroundColor(.secondary)
            Button("Spør coachen") { }
                .buttonStyle(.borderedProminent)
                .tint(.purple)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }
}

struct ScenarioButton: View {
    let title: String
    let icon: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.purple)
            Text(title)
                .font(.caption)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Color.purple.opacity(0.08))
        .cornerRadius(12)
    }
}
