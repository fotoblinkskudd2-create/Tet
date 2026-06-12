import SwiftUI
import SwiftData

struct AddItemView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = AddItemViewModel()

    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Title", text: $viewModel.title)
                    TextField("Notes", text: $viewModel.notes, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section("Category") {
                    Picker("Category", selection: $viewModel.category) {
                        ForEach(Category.allCases, id: \.self) { category in
                            Label(category.rawValue, systemImage: category.icon)
                                .tag(category)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Options") {
                    Toggle(isOn: $viewModel.isFavorite) {
                        Label("Mark as Favorite", systemImage: "star")
                    }
                }
            }
            .navigationTitle("New Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        viewModel.save(to: context)
                        dismiss()
                    }
                    .disabled(!viewModel.isValid)
                }
            }
        }
    }
}
