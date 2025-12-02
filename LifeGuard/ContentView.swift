import SwiftUI

struct ContentView: View {
    @EnvironmentObject var medicalProfile: MedicalProfileManager
    @EnvironmentObject var locationManager: LocationManager
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            EmergencySOSView()
                .tabItem {
                    Label("Emergency", systemImage: "phone.fill.badge.plus")
                }
                .tag(0)

            MedicalProfileView()
                .tabItem {
                    Label("Medical Info", systemImage: "heart.text.square.fill")
                }
                .tag(1)

            FirstAidGuideView()
                .tabItem {
                    Label("First Aid", systemImage: "cross.case.fill")
                }
                .tag(2)

            LocationShareView()
                .tabItem {
                    Label("Location", systemImage: "location.fill")
                }
                .tag(3)
        }
        .accentColor(.red)
    }
}

#Preview {
    ContentView()
        .environmentObject(MedicalProfileManager())
        .environmentObject(LocationManager())
}
