import XCTest
import SwiftData
@testable import Vilde

@MainActor
final class VildeTests: XCTestCase {

    // MARK: - Item Model Tests

    func testItemDefaultValues() {
        let item = Item(title: "Test Item")
        XCTAssertEqual(item.title, "Test Item")
        XCTAssertEqual(item.notes, "")
        XCTAssertEqual(item.category, .general)
        XCTAssertFalse(item.isFavorite)
        XCTAssertFalse(item.isCompleted)
        XCTAssertNotNil(item.id)
        XCTAssertNotNil(item.createdAt)
    }

    func testItemCategoryRoundtrip() {
        for category in Category.allCases {
            let item = Item(title: "Test", category: category)
            XCTAssertEqual(item.category, category)
            XCTAssertEqual(item.categoryRaw, category.rawValue)
        }
    }

    func testItemCategoryIconNotEmpty() {
        for category in Category.allCases {
            XCTAssertFalse(category.icon.isEmpty)
        }
    }

    // MARK: - AddItemViewModel Tests

    func testAddItemViewModelValidation() {
        let vm = AddItemViewModel()
        XCTAssertFalse(vm.isValid, "Empty title should be invalid")

        vm.title = "   "
        XCTAssertFalse(vm.isValid, "Whitespace-only title should be invalid")

        vm.title = "Hello"
        XCTAssertTrue(vm.isValid, "Non-empty title should be valid")
    }

    func testAddItemViewModelReset() {
        let vm = AddItemViewModel()
        vm.title = "Test"
        vm.notes = "Some notes"
        vm.category = .work
        vm.isFavorite = true

        vm.reset()

        XCTAssertEqual(vm.title, "")
        XCTAssertEqual(vm.notes, "")
        XCTAssertEqual(vm.category, .general)
        XCTAssertFalse(vm.isFavorite)
    }

    func testAddItemViewModelSave() throws {
        let container = try ModelContainer(
            for: Item.self,
            configurations: ModelConfiguration(isStoredInMemoryOnly: true)
        )
        let context = container.mainContext
        let vm = AddItemViewModel()
        vm.title = "  New Item  "
        vm.notes = "Notes here"
        vm.category = .shopping
        vm.isFavorite = true

        vm.save(to: context)

        let descriptor = FetchDescriptor<Item>()
        let saved = try context.fetch(descriptor)
        XCTAssertEqual(saved.count, 1)
        XCTAssertEqual(saved[0].title, "New Item")
        XCTAssertEqual(saved[0].notes, "Notes here")
        XCTAssertEqual(saved[0].category, .shopping)
        XCTAssertTrue(saved[0].isFavorite)
    }

    // MARK: - HomeViewModel Tests

    func testHomeViewModelFilterBySearch() {
        let vm = HomeViewModel()
        let items = [
            Item(title: "Buy milk"),
            Item(title: "Morning run"),
            Item(title: "Team meeting"),
        ]

        vm.searchText = "milk"
        let result = vm.filteredItems(items)
        XCTAssertEqual(result.count, 1)
        XCTAssertEqual(result[0].title, "Buy milk")
    }

    func testHomeViewModelFilterByCategory() {
        let vm = HomeViewModel()
        let items = [
            Item(title: "A", category: .work),
            Item(title: "B", category: .health),
            Item(title: "C", category: .work),
        ]

        vm.selectedCategory = .work
        let result = vm.filteredItems(items)
        XCTAssertEqual(result.count, 2)
    }

    func testHomeViewModelFilterFavoritesOnly() {
        let vm = HomeViewModel()
        let items = [
            Item(title: "A", isFavorite: true),
            Item(title: "B", isFavorite: false),
            Item(title: "C", isFavorite: true),
        ]

        vm.showFavoritesOnly = true
        let result = vm.filteredItems(items)
        XCTAssertEqual(result.count, 2)
    }

    func testHomeViewModelNoFilterReturnsAll() {
        let vm = HomeViewModel()
        let items = (0..<5).map { Item(title: "Item \($0)") }
        let result = vm.filteredItems(items)
        XCTAssertEqual(result.count, 5)
    }

    func testHomeViewModelToggleFavorite() {
        let vm = HomeViewModel()
        let item = Item(title: "Test", isFavorite: false)
        vm.toggleFavorite(item)
        XCTAssertTrue(item.isFavorite)
        vm.toggleFavorite(item)
        XCTAssertFalse(item.isFavorite)
    }

    func testHomeViewModelToggleCompleted() {
        let vm = HomeViewModel()
        let item = Item(title: "Test", isCompleted: false)
        vm.toggleCompleted(item)
        XCTAssertTrue(item.isCompleted)
        vm.toggleCompleted(item)
        XCTAssertFalse(item.isCompleted)
    }

    // MARK: - DetailViewModel Tests

    func testDetailViewModelBeginEditing() {
        let item = Item(title: "Original", notes: "Notes", category: .personal)
        let vm = DetailViewModel(item: item)

        vm.beginEditing()

        XCTAssertTrue(vm.isEditing)
        XCTAssertEqual(vm.editTitle, "Original")
        XCTAssertEqual(vm.editNotes, "Notes")
        XCTAssertEqual(vm.editCategory, .personal)
    }

    func testDetailViewModelSaveEdits() {
        let item = Item(title: "Old Title", notes: "Old notes", category: .general)
        let vm = DetailViewModel(item: item)
        vm.beginEditing()
        vm.editTitle = "  New Title  "
        vm.editNotes = "New notes"
        vm.editCategory = .work

        vm.saveEdits()

        XCTAssertEqual(item.title, "New Title")
        XCTAssertEqual(item.notes, "New notes")
        XCTAssertEqual(item.category, .work)
        XCTAssertFalse(vm.isEditing)
    }

    func testDetailViewModelCancelEditing() {
        let item = Item(title: "Original")
        let vm = DetailViewModel(item: item)
        vm.beginEditing()
        vm.editTitle = "Changed"

        vm.cancelEditing()

        XCTAssertFalse(vm.isEditing)
        XCTAssertEqual(item.title, "Original")
    }

    func testDetailViewModelEditValidation() {
        let item = Item(title: "Test")
        let vm = DetailViewModel(item: item)
        vm.beginEditing()
        vm.editTitle = ""
        XCTAssertFalse(vm.isEditValid)
        vm.editTitle = "Valid"
        XCTAssertTrue(vm.isEditValid)
    }

    // MARK: - SampleData Tests

    func testSampleDataInsertion() throws {
        let container = try ModelContainer(
            for: Item.self,
            configurations: ModelConfiguration(isStoredInMemoryOnly: true)
        )
        let context = container.mainContext

        XCTAssertFalse(SampleData.hasSampleData(in: context))
        SampleData.insertSampleItems(into: context)
        XCTAssertTrue(SampleData.hasSampleData(in: context))

        let descriptor = FetchDescriptor<Item>()
        let items = try context.fetch(descriptor)
        XCTAssertGreaterThan(items.count, 0)
    }

    func testSampleDataItemsHaveValidTitles() throws {
        let container = try ModelContainer(
            for: Item.self,
            configurations: ModelConfiguration(isStoredInMemoryOnly: true)
        )
        let context = container.mainContext
        SampleData.insertSampleItems(into: context)

        let descriptor = FetchDescriptor<Item>()
        let items = try context.fetch(descriptor)
        for item in items {
            XCTAssertFalse(item.title.isEmpty)
        }
    }
}
