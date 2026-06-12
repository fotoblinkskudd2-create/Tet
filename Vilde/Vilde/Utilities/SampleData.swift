import Foundation
import SwiftData

enum SampleData {
    static func insertSampleItems(into context: ModelContext) {
        let items: [Item] = [
            Item(title: "Buy groceries", notes: "Milk, eggs, bread, and butter", category: .shopping),
            Item(title: "Morning run", notes: "5 km around the park before work", category: .health, isFavorite: true),
            Item(title: "Team standup", notes: "Discuss Q2 roadmap with stakeholders", category: .work),
            Item(title: "Read SwiftUI docs", notes: "Focus on Chapter 5: animations", category: .personal, isFavorite: true),
            Item(title: "Call mom", notes: "Her birthday is coming up next week", category: .personal),
            Item(title: "Update portfolio", notes: "Add recent iOS projects and screenshots", category: .work),
            Item(title: "Dentist appointment", notes: "Tuesday at 3 pm — remember insurance card", category: .health),
            Item(title: "Plan weekend trip", notes: "Look up Fjord hiking routes", category: .general, isFavorite: true),
            Item(title: "Refactor networking layer", notes: "Move to async/await, remove Combine", category: .work),
            Item(title: "Yoga class", notes: "Wednesday 6:30 pm at the studio", category: .health),
        ]
        items.forEach { context.insert($0) }
    }

    static func hasSampleData(in context: ModelContext) -> Bool {
        let descriptor = FetchDescriptor<Item>()
        let count = (try? context.fetchCount(descriptor)) ?? 0
        return count > 0
    }
}
