import SwiftUI
import MapKit

struct LocationShareView: View {
    @EnvironmentObject var locationManager: LocationManager
    @State private var showingShareSheet = false
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
        span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
    )

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Map View
                Map(coordinateRegion: $region, showsUserLocation: true, userTrackingMode: .constant(.follow))
                    .frame(height: 300)
                    .cornerRadius(15)
                    .padding()

                // Location Info
                VStack(spacing: 20) {
                    if let location = locationManager.location {
                        VStack(spacing: 15) {
                            InfoCard(
                                icon: "location.fill",
                                title: "Current Location",
                                value: String(format: "%.6f, %.6f", location.coordinate.latitude, location.coordinate.longitude),
                                color: .blue
                            )

                            if let address = locationManager.address {
                                InfoCard(
                                    icon: "map.fill",
                                    title: "Address",
                                    value: address,
                                    color: .green
                                )
                            }

                            InfoCard(
                                icon: "speedometer",
                                title: "Accuracy",
                                value: String(format: "±%.0f meters", location.horizontalAccuracy),
                                color: .orange
                            )
                        }

                        // Action Buttons
                        VStack(spacing: 12) {
                            Button(action: {
                                showingShareSheet = true
                            }) {
                                Label("Share Location via SMS", systemImage: "message.fill")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue)
                                    .cornerRadius(10)
                            }

                            Button(action: {
                                openInMaps()
                            }) {
                                Label("Open in Maps", systemImage: "map")
                                    .font(.headline)
                                    .foregroundColor(.blue)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(10)
                            }

                            Button(action: {
                                copyLocationToClipboard()
                            }) {
                                Label("Copy Coordinates", systemImage: "doc.on.doc")
                                    .font(.headline)
                                    .foregroundColor(.gray)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.gray.opacity(0.1))
                                    .cornerRadius(10)
                            }
                        }
                        .padding(.horizontal)

                        // Emergency Note
                        Text("💡 Share this location with emergency responders or contacts when you need help")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding()
                    } else {
                        VStack(spacing: 20) {
                            Image(systemName: "location.slash.fill")
                                .font(.system(size: 50))
                                .foregroundColor(.gray)

                            Text("Location Not Available")
                                .font(.headline)

                            if locationManager.authorizationStatus == .denied || locationManager.authorizationStatus == .restricted {
                                Text("Please enable location services in Settings to use this feature.")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)

                                Button(action: {
                                    if let url = URL(string: UIApplication.openSettingsURLString) {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    Text("Open Settings")
                                        .font(.headline)
                                        .foregroundColor(.white)
                                        .padding()
                                        .background(Color.blue)
                                        .cornerRadius(10)
                                }
                            } else {
                                Text("Requesting location access...")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding()
                    }
                }

                Spacer()
            }
            .navigationTitle("Location Sharing")
            .onAppear {
                locationManager.requestPermission()
                if let location = locationManager.location {
                    region.center = location.coordinate
                }
            }
            .onChange(of: locationManager.location) { newLocation in
                if let location = newLocation {
                    region.center = location.coordinate
                }
            }
            .sheet(isPresented: $showingShareSheet) {
                if let location = locationManager.location {
                    ShareSheet(items: [createLocationMessage(location)])
                }
            }
        }
    }

    private func createLocationMessage(_ location: CLLocation) -> String {
        var message = "🚨 EMERGENCY LOCATION SHARE\n\n"
        message += "I need help! My current location:\n\n"
        message += "Coordinates: \(location.coordinate.latitude), \(location.coordinate.longitude)\n\n"

        if let address = locationManager.address {
            message += "Address: \(address)\n\n"
        }

        message += "Google Maps: https://maps.google.com/?q=\(location.coordinate.latitude),\(location.coordinate.longitude)\n\n"
        message += "Apple Maps: http://maps.apple.com/?ll=\(location.coordinate.latitude),\(location.coordinate.longitude)\n\n"
        message += "Sent from LifeGuard Emergency App"

        return message
    }

    private func openInMaps() {
        guard let location = locationManager.location else { return }

        let coordinate = location.coordinate
        let mapItem = MKMapItem(placemark: MKPlacemark(coordinate: coordinate))
        mapItem.name = "My Emergency Location"
        mapItem.openInMaps(launchOptions: [MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeDriving])
    }

    private func copyLocationToClipboard() {
        guard let location = locationManager.location else { return }

        let coordinates = "\(location.coordinate.latitude), \(location.coordinate.longitude)"
        UIPasteboard.general.string = coordinates
    }
}

struct InfoCard: View {
    let icon: String
    let title: String
    let value: String
    let color: Color

    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
                .frame(width: 40)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.body)
                    .fontWeight(.medium)
            }

            Spacer()
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(radius: 2)
        .padding(.horizontal)
    }
}

#Preview {
    LocationShareView()
        .environmentObject(LocationManager())
}
