import SwiftUI
import SwiftData

@main
struct VildeApp: App {
    let modelContainer: ModelContainer

    init() {
        do {
            modelContainer = try ModelContainer(for: Item.self)
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }

        seedSampleDataIfNeeded()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(modelContainer)
    }

    private func seedSampleDataIfNeeded() {
        let context = modelContainer.mainContext
        guard !SampleData.hasSampleData(in: context) else { return }
        SampleData.insertSampleItems(into: context)
    }
}
