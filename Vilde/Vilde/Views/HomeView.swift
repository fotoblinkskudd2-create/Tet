import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \Item.createdAt, order: .reverse) private var items: [Item]
    @StateObject private var viewModel = HomeViewModel()
    @State private var showingAddItem = false
    @State private var selectedItem: Item?

    var body: some View {
        NavigationStack {
            Group {
                if filteredItems.isEmpty {
                    emptyState
                } else {
                    itemList
                }
            }
            .navigationTitle("Vilde")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddItem = true
                    } label: {
                        Label("Add Item", systemImage: "plus")
                    }
                }
                ToolbarItem(placement: .topBarLeading) {
                    filterMenu
                }
            }
            .searchable(text: $viewModel.searchText, prompt: "Search items")
            .sheet(isPresented: $showingAddItem) {
                AddItemView()
            }
            .navigationDestination(item: $selectedItem) { item in
                DetailView(item: item)
            }
        }
    }

    private var filteredItems: [Item] {
        viewModel.filteredItems(items)
    }

    private var itemList: some View {
        List {
            categoryFilter
            ForEach(filteredItems) { item in
                ItemRow(item: item, viewModel: viewModel)
                    .contentShape(Rectangle())
                    .onTapGesture { selectedItem = item }
            }
            .onDelete { offsets in
                viewModel.deleteItems(filteredItems, offsets: offsets, from: context)
            }
        }
    }

    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                CategoryChip(
                    title: "All",
                    icon: "tray.2",
                    isSelected: viewModel.selectedCategory == nil
                ) {
                    viewModel.selectedCategory = nil
                }
                ForEach(Category.allCases, id: \.self) { category in
                    CategoryChip(
                        title: category.rawValue,
                        icon: category.icon,
                        isSelected: viewModel.selectedCategory == category
                    ) {
                        viewModel.selectedCategory =
                            viewModel.selectedCategory == category ? nil : category
                    }
                }
            }
            .padding(.vertical, 4)
        }
        .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
        .listRowBackground(Color.clear)
        .listRowSeparator(.hidden)
    }

    private var filterMenu: some View {
        Menu {
            Toggle("Favorites Only", isOn: $viewModel.showFavoritesOnly)
        } label: {
            Label(
                "Filter",
                systemImage: viewModel.showFavoritesOnly
                    ? "line.3.horizontal.decrease.circle.fill"
                    : "line.3.horizontal.decrease.circle"
            )
        }
    }

    private var emptyState: some View {
        ContentUnavailableView {
            Label("No Items", systemImage: "tray")
        } description: {
            Text(viewModel.searchText.isEmpty && viewModel.selectedCategory == nil
                 ? "Tap + to add your first item."
                 : "No items match your current filters.")
        } actions: {
            if viewModel.searchText.isEmpty && viewModel.selectedCategory == nil {
                Button("Add Item") { showingAddItem = true }
                    .buttonStyle(.borderedProminent)
            }
        }
    }
}

struct ItemRow: View {
    let item: Item
    let viewModel: HomeViewModel

    var body: some View {
        HStack(spacing: 12) {
            Button {
                viewModel.toggleCompleted(item)
            } label: {
                Image(systemName: item.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(item.isCompleted ? .green : .secondary)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .strikethrough(item.isCompleted)
                    .foregroundStyle(item.isCompleted ? .secondary : .primary)
                HStack(spacing: 4) {
                    Image(systemName: item.category.icon)
                        .font(.caption2)
                    Text(item.category.rawValue)
                        .font(.caption)
                }
                .foregroundStyle(.secondary)
            }

            Spacer()

            if item.isFavorite {
                Image(systemName: "star.fill")
                    .font(.caption)
                    .foregroundStyle(.yellow)
            }
        }
        .padding(.vertical, 2)
        .swipeActions(edge: .leading) {
            Button {
                viewModel.toggleFavorite(item)
            } label: {
                Label(item.isFavorite ? "Unfavorite" : "Favorite",
                      systemImage: item.isFavorite ? "star.slash" : "star")
            }
            .tint(.yellow)
        }
    }
}

struct CategoryChip: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: icon)
                .font(.caption)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(isSelected ? Color.accentColor : Color(.systemGray6))
                .foregroundStyle(isSelected ? .white : .primary)
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}
