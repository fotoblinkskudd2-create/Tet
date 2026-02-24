// SaverPlate iOS — Kartvisning med matoverskudd-tilbud nær brukeren
import SwiftUI
import MapKit
import CoreLocation

struct Listing: Codable, Identifiable {
    let id: String
    let store: Store
    let title: String
    let description: String
    let originalPrice: Double
    let price: Double
    let quantityAvailable: Int
    let pickupStart: String
    let pickupEnd: String
    let imageUrl: String?
    let distanceKm: Double

    enum CodingKeys: String, CodingKey {
        case id, store, title, description, price
        case originalPrice = "original_price"
        case quantityAvailable = "quantity_available"
        case pickupStart = "pickup_start"
        case pickupEnd = "pickup_end"
        case imageUrl = "image_url"
        case distanceKm = "distance_km"
    }
}

struct Store: Codable {
    let id: String
    let name: String
    let lat: Double
    let lng: Double
}

// MARK: - Location Manager

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

// MARK: - API

class ListingsAPI {
    static let shared = ListingsAPI()
    private let baseURL = "https://api.saverplate.com/v1"

    func fetchNearby(lat: Double, lng: Double, radius: Double = 5) async throws -> [Listing] {
        let url = URL(string: "\(baseURL)/listings?lat=\(lat)&lng=\(lng)&r=\(radius)")!
        var req = URLRequest(url: url)
        if let token = UserDefaults.standard.string(forKey: "sp_token") {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        let (data, _) = try await URLSession.shared.data(for: req)
        let response = try JSONDecoder().decode(ListingsResponse.self, from: data)
        return response.listings
    }

    func placeOrder(listingId: String, quantity: Int) async throws {
        let url = URL(string: "\(baseURL)/orders")!
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = UserDefaults.standard.string(forKey: "sp_token") {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        let body: [String: Any] = ["listing_id": listingId, "quantity": quantity]
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (_, response) = try await URLSession.shared.data(for: req)
        guard let http = response as? HTTPURLResponse, http.statusCode == 201 else {
            throw URLError(.badServerResponse)
        }
    }
}

struct ListingsResponse: Codable {
    let listings: [Listing]
    let total: Int
}

// MARK: - ViewModel

@MainActor
class MapListingsViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var selectedListing: Listing?
    @Published var isLoading = false

    func load(lat: Double, lng: Double) async {
        isLoading = true
        do {
            listings = try await ListingsAPI.shared.fetchNearby(lat: lat, lng: lng)
        } catch {
            print("Feil: \(error)")
        }
        isLoading = false
    }
}

// MARK: - Views

struct MapListingsView: View {
    @StateObject private var vm = MapListingsViewModel()
    @StateObject private var locationManager = LocationManager()
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 59.91, longitude: 10.75),
        span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
    )

    var body: some View {
        ZStack(alignment: .bottom) {
            Map(coordinateRegion: $region, annotationItems: vm.listings) { listing in
                MapAnnotation(coordinate: CLLocationCoordinate2D(latitude: listing.store.lat, longitude: listing.store.lng)) {
                    Button { vm.selectedListing = listing } label: {
                        VStack(spacing: 2) {
                            Image(systemName: "leaf.fill")
                                .foregroundStyle(.white)
                                .padding(8)
                                .background(Color.green)
                                .clipShape(Circle())
                            Text("\(Int(listing.price)) kr")
                                .font(.caption2.bold())
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(.white)
                                .cornerRadius(4)
                                .shadow(radius: 2)
                        }
                    }
                }
            }
            .ignoresSafeArea()

            VStack(spacing: 0) {
                if vm.isLoading {
                    ProgressView()
                        .padding()
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(vm.listings) { listing in
                            ListingCard(listing: listing)
                                .onTapGesture { vm.selectedListing = listing }
                        }
                    }
                    .padding()
                }
                .background(.ultraThinMaterial)
                .cornerRadius(20, corners: [.topLeft, .topRight])
            }
        }
        .sheet(item: $vm.selectedListing) { listing in
            ListingDetailSheet(listing: listing)
        }
        .task {
            if let loc = locationManager.location {
                region.center = loc
                await vm.load(lat: loc.latitude, lng: loc.longitude)
            }
        }
        .onChange(of: locationManager.location) { newLoc in
            guard let loc = newLoc else { return }
            region.center = loc
            Task { await vm.load(lat: loc.latitude, lng: loc.longitude) }
        }
    }
}

struct ListingCard: View {
    let listing: Listing

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.green.opacity(0.15))
                .frame(width: 200, height: 100)
                .overlay {
                    Image(systemName: "takeoutbag.and.cup.and.straw.fill")
                        .font(.largeTitle)
                        .foregroundStyle(.green)
                }

            Text(listing.store.name)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(listing.title)
                .font(.subheadline.bold())
                .lineLimit(1)
            HStack {
                Text("\(Int(listing.price)) kr")
                    .font(.headline)
                    .foregroundStyle(.green)
                Text("\(Int(listing.originalPrice)) kr")
                    .font(.caption)
                    .strikethrough()
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(String(format: "%.1f", listing.distanceKm)) km")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(width: 200)
        .padding()
        .background(.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.08), radius: 8, y: 4)
        .accessibilityElement(children: .combine)
    }
}

struct ListingDetailSheet: View {
    let listing: Listing
    @State private var quantity = 1
    @State private var ordering = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.green.opacity(0.1))
                        .frame(height: 200)
                        .overlay {
                            Image(systemName: "takeoutbag.and.cup.and.straw.fill")
                                .font(.system(size: 64))
                                .foregroundStyle(.green)
                        }

                    Text(listing.store.name)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(listing.title)
                        .font(.title2.bold())
                    Text(listing.description)
                        .foregroundStyle(.secondary)

                    HStack {
                        VStack(alignment: .leading) {
                            Text("\(Int(listing.price)) kr")
                                .font(.title.bold())
                                .foregroundStyle(.green)
                            Text("Verdi: \(Int(listing.originalPrice)) kr")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Stepper("Antall: \(quantity)", value: $quantity, in: 1...listing.quantityAvailable)
                            .labelsHidden()
                    }

                    Text("Hent mellom \(formatTime(listing.pickupStart)) – \(formatTime(listing.pickupEnd))")
                        .font(.callout)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(12)

                    Button {
                        Task {
                            ordering = true
                            try? await ListingsAPI.shared.placeOrder(listingId: listing.id, quantity: quantity)
                            ordering = false
                            dismiss()
                        }
                    } label: {
                        if ordering {
                            ProgressView().frame(maxWidth: .infinity)
                        } else {
                            Text("Bestill — \(quantity * Int(listing.price)) kr")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)
                    .controlSize(.large)
                }
                .padding()
            }
            .navigationTitle("Tilbud")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func formatTime(_ iso: String) -> String {
        let f = ISO8601DateFormatter()
        guard let date = f.date(from: iso) else { return iso }
        let tf = DateFormatter()
        tf.timeStyle = .short
        return tf.string(from: date)
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat
    var corners: UIRectCorner

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners,
                                cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}
