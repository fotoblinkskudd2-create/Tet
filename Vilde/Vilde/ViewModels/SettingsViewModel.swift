import Foundation
import SwiftData
import Combine

enum SortOrder: String, CaseIterable {
    case dateDesc = "Newest First"
    case dateAsc = "Oldest First"
    case titleAsc = "A to Z"
    case titleDesc = "Z to A"
}

final class SettingsViewModel: ObservableObject {
    @Published var showCompletedItems: Bool {
        didSet { UserDefaults.standard.set(showCompletedItems, forKey: "showCompletedItems") }
    }

    @Published var sortOrder: SortOrder {
        didSet { UserDefaults.standard.set(sortOrder.rawValue, forKey: "sortOrder") }
    }

    var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }

    init() {
        showCompletedItems = UserDefaults.standard.bool(forKey: "showCompletedItems")
        let rawSortOrder = UserDefaults.standard.string(forKey: "sortOrder") ?? ""
        sortOrder = SortOrder(rawValue: rawSortOrder) ?? .dateDesc
    }

    func deleteAllItems(context: ModelContext) {
        do {
            try context.delete(model: Item.self)
        } catch {
            print("Failed to delete items: \(error)")
        }
    }
}
