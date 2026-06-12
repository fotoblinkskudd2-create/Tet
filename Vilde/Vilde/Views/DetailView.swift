import SwiftUI
import SwiftData

struct DetailView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel: DetailViewModel
    @State private var showDeleteAlert = false

    init(item: Item) {
        _viewModel = StateObject(wrappedValue: DetailViewModel(item: item))
    }

    var body: some View {
        Group {
            if viewModel.isEditing {
                editForm
            } else {
                detailContent
            }
        }
        .navigationTitle(viewModel.isEditing ? "Edit Item" : viewModel.item.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if viewModel.isEditing {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { viewModel.cancelEditing() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { viewModel.saveEdits() }
                        .disabled(!viewModel.isEditValid)
                }
            } else {
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        Button { viewModel.beginEditing() } label: {
                            Label("Edit", systemImage: "pencil")
                        }
                        Button {
                            viewModel.toggleFavorite()
                        } label: {
                            Label(
                                viewModel.item.isFavorite ? "Remove Favorite" : "Add Favorite",
                                systemImage: viewModel.item.isFavorite ? "star.slash" : "star"
                            )
                        }
                        Divider()
                        Button(role: .destructive) {
                            showDeleteAlert = true
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
        .alert("Delete Item", isPresented: $showDeleteAlert) {
            Button("Delete", role: .destructive) {
                context.delete(viewModel.item)
                dismiss()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This action cannot be undone.")
        }
    }

    private var detailContent: some View {
        List {
            Section {
                HStack {
                    Button {
                        viewModel.toggleCompleted()
                    } label: {
                        Image(systemName: viewModel.item.isCompleted
                              ? "checkmark.circle.fill" : "circle")
                            .font(.title2)
                            .foregroundStyle(viewModel.item.isCompleted ? .green : .secondary)
                    }
                    .buttonStyle(.plain)
                    Text(viewModel.item.isCompleted ? "Completed" : "Not completed")
                        .foregroundStyle(.secondary)
                }
            }

            if !viewModel.item.notes.isEmpty {
                Section("Notes") {
                    Text(viewModel.item.notes)
                }
            }

            Section("Info") {
                LabeledContent("Category") {
                    Label(viewModel.item.category.rawValue,
                          systemImage: viewModel.item.category.icon)
                        .foregroundStyle(.secondary)
                }
                LabeledContent("Created") {
                    Text(viewModel.item.createdAt.formatted(date: .abbreviated, time: .shortened))
                        .foregroundStyle(.secondary)
                }
                LabeledContent("Favorite") {
                    Image(systemName: viewModel.item.isFavorite ? "star.fill" : "star")
                        .foregroundStyle(viewModel.item.isFavorite ? .yellow : .secondary)
                }
            }
        }
    }

    private var editForm: some View {
        Form {
            Section("Details") {
                TextField("Title", text: $viewModel.editTitle)
                TextField("Notes", text: $viewModel.editNotes, axis: .vertical)
                    .lineLimit(3...6)
            }
            Section("Category") {
                Picker("Category", selection: $viewModel.editCategory) {
                    ForEach(Category.allCases, id: \.self) { category in
                        Label(category.rawValue, systemImage: category.icon)
                            .tag(category)
                    }
                }
                .pickerStyle(.menu)
            }
        }
    }
}
