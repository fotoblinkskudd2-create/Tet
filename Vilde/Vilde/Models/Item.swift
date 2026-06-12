import Foundation
import SwiftData

enum Category: String, CaseIterable, Codable {
    case general = "General"
    case work = "Work"
    case personal = "Personal"
    case shopping = "Shopping"
    case health = "Health"

    var icon: String {
        switch self {
        case .general: return "tray"
        case .work: return "briefcase"
        case .personal: return "person"
        case .shopping: return "cart"
        case .health: return "heart"
        }
    }
}

@Model
final class Item {
    var id: UUID
    var title: String
    var notes: String
    var categoryRaw: String
    var createdAt: Date
    var isFavorite: Bool
    var isCompleted: Bool

    var category: Category {
        get { Category(rawValue: categoryRaw) ?? .general }
        set { categoryRaw = newValue.rawValue }
    }

    init(
        title: String,
        notes: String = "",
        category: Category = .general,
        isFavorite: Bool = false,
        isCompleted: Bool = false
    ) {
        self.id = UUID()
        self.title = title
        self.notes = notes
        self.categoryRaw = category.rawValue
        self.createdAt = Date()
        self.isFavorite = isFavorite
        self.isCompleted = isCompleted
    }
}
