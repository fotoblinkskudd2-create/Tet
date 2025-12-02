import SwiftUI

@main
struct LifeGuardApp: App {
    @StateObject private var medicalProfile = MedicalProfileManager()
    @StateObject private var locationManager = LocationManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(medicalProfile)
                .environmentObject(locationManager)
        }
    }
}
