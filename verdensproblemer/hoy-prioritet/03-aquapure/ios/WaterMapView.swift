// AquaPure iOS — Vannkvalitetskart med crowdsourced rapportering
import SwiftUI
import MapKit
import CoreLocation

struct WaterReport: Codable, Identifiable {
    let id: String
    let lat: Double
    let lng: Double
    let type: String
    let severity: Int
    let description: String
    let photoUrl: String?
    let verified: Bool
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, lat, lng, type, severity, description, verified
        case photoUrl = "photo_url"
        case createdAt = "created_at"
    }
}

struct QualityData: Codable {
    let ph: Double
    let chlorine: Double
    let turbidity: Double
    let safetyLevel: String
    let lastUpdated: String

    enum CodingKeys: String, CodingKey {
        case ph, chlorine, turbidity
        case safetyLevel = "safety_level"
        case lastUpdated = "last_updated"
    }
}

// MARK: - API

class WaterAPI {
    static let shared = WaterAPI()
    private let baseURL = "https://api.aquapure.io/v1"

    func fetchReports(lat: Double, lng: Double, radius: Double = 10) async throws -> [WaterReport] {
        let url = URL(string: "\(baseURL)/reports?lat=\(lat)&lng=\(lng)&r=\(radius)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([WaterReport].self, from: data)
    }

    func submitReport(lat: Double, lng: Double, type: String, severity: Int, description: String) async throws -> WaterReport {
        var req = URLRequest(url: URL(string: "\(baseURL)/reports")!)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = ["lat": lat, "lng": lng, "type": type, "severity": severity, "description": description]
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(WaterReport.self, from: data)
    }

    func fetchQuality(lat: Double, lng: Double) async throws -> QualityData {
        let url = URL(string: "\(baseURL)/quality?lat=\(lat)&lng=\(lng)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(QualityData.self, from: data)
    }
}

// MARK: - ViewModel

@MainActor
class WaterMapViewModel: ObservableObject {
    @Published var reports: [WaterReport] = []
    @Published var quality: QualityData?
    @Published var isLoading = false

    func load(lat: Double, lng: Double) async {
        isLoading = true
        do {
            async let reportsTask = WaterAPI.shared.fetchReports(lat: lat, lng: lng)
            async let qualityTask = WaterAPI.shared.fetchQuality(lat: lat, lng: lng)
            reports = try await reportsTask
            quality = try await qualityTask
        } catch {
            print("Load error: \(error)")
        }
        isLoading = false
    }

    func submitReport(lat: Double, lng: Double, type: String, severity: Int, description: String) async {
        do {
            let report = try await WaterAPI.shared.submitReport(lat: lat, lng: lng, type: type, severity: severity, description: description)
            reports.append(report)
        } catch {
            print("Submit error: \(error)")
        }
    }
}

// MARK: - Views

struct WaterMapView: View {
    @StateObject private var vm = WaterMapViewModel()
    @StateObject private var locationManager = LocationManager()
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: -6.8, longitude: 37.7),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    @State private var showReportSheet = false
    @State private var selectedReport: WaterReport?

    var body: some View {
        NavigationStack {
            ZStack {
                Map(coordinateRegion: $region, annotationItems: vm.reports) { report in
                    MapAnnotation(coordinate: CLLocationCoordinate2D(latitude: report.lat, longitude: report.lng)) {
                        Button { selectedReport = report } label: {
                            Circle()
                                .fill(severityColor(report.severity))
                                .frame(width: 20, height: 20)
                                .overlay {
                                    Image(systemName: "drop.fill")
                                        .font(.caption2)
                                        .foregroundStyle(.white)
                                }
                                .shadow(radius: 3)
                        }
                    }
                }
                .ignoresSafeArea(edges: .bottom)

                VStack {
                    if let q = vm.quality {
                        QualityBanner(quality: q)
                            .padding(.horizontal)
                    }
                    Spacer()
                }
            }
            .navigationTitle("AquaPure")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showReportSheet = true } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                    .accessibilityLabel("Rapporter vannproblem")
                }
            }
            .sheet(isPresented: $showReportSheet) {
                ReportFormView(vm: vm, lat: region.center.latitude, lng: region.center.longitude)
            }
            .sheet(item: $selectedReport) { report in
                ReportDetailView(report: report)
            }
            .task {
                let lat = locationManager.location?.latitude ?? -6.8
                let lng = locationManager.location?.longitude ?? 37.7
                region.center = CLLocationCoordinate2D(latitude: lat, longitude: lng)
                await vm.load(lat: lat, lng: lng)
            }
        }
    }

    private func severityColor(_ severity: Int) -> Color {
        switch severity {
        case 1...2: return .green
        case 3...4: return .yellow
        case 5...7: return .orange
        default: return .red
        }
    }
}

struct QualityBanner: View {
    let quality: QualityData

    var safetyColor: Color {
        switch quality.safetyLevel {
        case "safe": return .green
        case "moderate": return .orange
        default: return .red
        }
    }

    var body: some View {
        HStack {
            Circle()
                .fill(safetyColor)
                .frame(width: 12, height: 12)
            Text(quality.safetyLevel == "safe" ? "Trygt vann" : quality.safetyLevel == "moderate" ? "Vær forsiktig" : "Utrygt")
                .font(.subheadline.bold())
            Spacer()
            VStack(alignment: .trailing) {
                Text("pH \(String(format: "%.1f", quality.ph))")
                    .font(.caption)
                Text("Turbiditet \(String(format: "%.1f", quality.turbidity)) NTU")
                    .font(.caption)
            }
            .foregroundStyle(.secondary)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}

struct ReportFormView: View {
    @ObservedObject var vm: WaterMapViewModel
    let lat: Double
    let lng: Double
    @State private var type = "contamination"
    @State private var severity: Double = 5
    @State private var description = ""
    @Environment(\.dismiss) private var dismiss

    let types = [
        ("contamination", "Forurensning"),
        ("taste", "Dårlig smak"),
        ("odor", "Lukt"),
        ("disease", "Sykdomstilfeller"),
        ("shortage", "Vannmangel"),
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Type problem") {
                    Picker("Type", selection: $type) {
                        ForEach(types, id: \.0) { t in
                            Text(t.1).tag(t.0)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Alvorlighetsgrad: \(Int(severity))/10") {
                    Slider(value: $severity, in: 1...10, step: 1)
                        .accessibilityLabel("Alvorlighetsgrad")
                }

                Section("Beskrivelse") {
                    TextField("Beskriv problemet…", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("Ny rapport")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Avbryt") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Send") {
                        Task {
                            await vm.submitReport(lat: lat, lng: lng, type: type, severity: Int(severity), description: description)
                            dismiss()
                        }
                    }
                    .disabled(description.isEmpty)
                }
            }
        }
    }
}

struct ReportDetailView: View {
    let report: WaterReport

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "drop.fill")
                    .foregroundStyle(.blue)
                Text(report.type.capitalized)
                    .font(.headline)
                Spacer()
                Text("Alvorlighet: \(report.severity)/10")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(report.severity > 5 ? Color.red.opacity(0.2) : Color.orange.opacity(0.2))
                    .cornerRadius(8)
            }
            Text(report.description)
                .foregroundStyle(.secondary)
            if report.verified {
                Label("Verifisert", systemImage: "checkmark.seal.fill")
                    .foregroundStyle(.green)
            }
            Text("Rapportert \(report.createdAt)")
                .font(.caption2)
                .foregroundStyle(.tertiary)
            Spacer()
        }
        .padding()
    }
}

// Reuse LocationManager from SaverPlate (same pattern)
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var location: CLLocationCoordinate2D?
    private let manager = CLLocationManager()
    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
        manager.requestWhenInUseAuthorization()
        manager.startUpdatingLocation()
    }
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        location = locations.last?.coordinate
        manager.stopUpdatingLocation()
    }
}
