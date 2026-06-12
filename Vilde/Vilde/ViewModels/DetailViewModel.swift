import Foundation
import Combine

final class DetailViewModel: ObservableObject {
    var item: Item
    @Published var isEditing = false
    @Published var editTitle = ""
    @Published var editNotes = ""
    @Published var editCategory: Category = .general

    var isEditValid: Bool {
        !editTitle.trimmingCharacters(in: .whitespaces).isEmpty
    }

    init(item: Item) {
        self.item = item
    }

    func beginEditing() {
        editTitle = item.title
        editNotes = item.notes
        editCategory = item.category
        isEditing = true
    }

    func saveEdits() {
        item.title = editTitle.trimmingCharacters(in: .whitespaces)
        item.notes = editNotes
        item.category = editCategory
        isEditing = false
    }

    func cancelEditing() {
        isEditing = false
    }

    func toggleFavorite() {
        item.isFavorite.toggle()
    }

    func toggleCompleted() {
        item.isCompleted.toggle()
    }
}
