import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var context
    @StateObject private var viewModel = SettingsViewModel()
    @State private var showDeleteAlert = false
    @State private var showSampleDataAlert = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Preferences") {
                    Toggle("Show Completed Items", isOn: $viewModel.showCompletedItems)

                    Picker("Sort Order", selection: $viewModel.sortOrder) {
                        ForEach(SortOrder.allCases, id: \.self) { order in
                            Text(order.rawValue).tag(order)
                        }
                    }
                }

                Section("Data") {
                    Button {
                        showSampleDataAlert = true
                    } label: {
                        Label("Load Sample Data", systemImage: "square.and.arrow.down")
                    }

                    Button(role: .destructive) {
                        showDeleteAlert = true
                    } label: {
                        Label("Delete All Items", systemImage: "trash")
                    }
                }

                Section("About") {
                    LabeledContent("Version", value: viewModel.appVersion)
                    LabeledContent("Build", value: viewModel.buildNumber)
                }
            }
            .navigationTitle("Settings")
            .alert("Delete All Items", isPresented: $showDeleteAlert) {
                Button("Delete All", role: .destructive) {
                    viewModel.deleteAllItems(context: context)
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("All items will be permanently deleted. This cannot be undone.")
            }
            .alert("Load Sample Data", isPresented: $showSampleDataAlert) {
                Button("Load") {
                    SampleData.insertSampleItems(into: context)
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This will add sample items to your list.")
            }
        }
    }
}
