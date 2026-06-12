import Foundation
import SwiftData
import Combine

final class AddItemViewModel: ObservableObject {
    @Published var title = ""
    @Published var notes = ""
    @Published var category: Category = .general
    @Published var isFavorite = false

    var isValid: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty
    }

    func save(to context: ModelContext) {
        let item = Item(
            title: title.trimmingCharacters(in: .whitespaces),
            notes: notes,
            category: category,
            isFavorite: isFavorite
        )
        context.insert(item)
    }

    func reset() {
        title = ""
        notes = ""
        category = .general
        isFavorite = false
    }
}
