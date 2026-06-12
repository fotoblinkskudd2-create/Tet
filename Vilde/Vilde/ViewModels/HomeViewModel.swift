import Foundation
import SwiftData
import Combine

final class HomeViewModel: ObservableObject {
    @Published var searchText = ""
    @Published var selectedCategory: Category?
    @Published var showFavoritesOnly = false

    func filteredItems(_ items: [Item]) -> [Item] {
        items.filter { item in
            let matchesSearch = searchText.isEmpty ||
                item.title.localizedCaseInsensitiveContains(searchText)
            let matchesCategory = selectedCategory == nil ||
                item.category == selectedCategory
            let matchesFavorites = !showFavoritesOnly || item.isFavorite
            return matchesSearch && matchesCategory && matchesFavorites
        }
    }

    func deleteItems(_ items: [Item], offsets: IndexSet, from context: ModelContext) {
        for index in offsets {
            context.delete(items[index])
        }
    }

    func toggleFavorite(_ item: Item) {
        item.isFavorite.toggle()
    }

    func toggleCompleted(_ item: Item) {
        item.isCompleted.toggle()
    }
}
