import SwiftUI

struct FirstAidGuideView: View {
    @State private var searchText = ""
    @State private var selectedCategory: String? = nil

    var filteredItems: [FirstAidItem] {
        let items = FirstAidDatabase.items

        var filtered = items
        if let category = selectedCategory {
            filtered = filtered.filter { $0.category == category }
        }

        if !searchText.isEmpty {
            filtered = filtered.filter { item in
                item.title.localizedCaseInsensitiveContains(searchText) ||
                item.category.localizedCaseInsensitiveContains(searchText)
            }
        }

        return filtered
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Category Filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        CategoryButton(title: "All", isSelected: selectedCategory == nil) {
                            selectedCategory = nil
                        }

                        ForEach(FirstAidDatabase.categories, id: \.self) { category in
                            CategoryButton(title: category, isSelected: selectedCategory == category) {
                                selectedCategory = category
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 10)
                }
                .background(Color(.systemGroupedBackground))

                // Items List
                List(filteredItems) { item in
                    NavigationLink(destination: FirstAidDetailView(item: item)) {
                        HStack(spacing: 15) {
                            Image(systemName: item.icon)
                                .font(.title2)
                                .foregroundColor(categoryColor(item.category))
                                .frame(width: 40)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.title)
                                    .font(.headline)
                                Text(item.category)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            Spacer()

                            if item.category == "Life-Threatening" {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.red)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                .listStyle(PlainListStyle())
            }
            .navigationTitle("First Aid Guide")
            .searchable(text: $searchText, prompt: "Search first aid procedures")
        }
    }

    private func categoryColor(_ category: String) -> Color {
        switch category {
        case "Life-Threatening":
            return .red
        case "Medical Emergency":
            return .orange
        case "Common Injuries":
            return .blue
        case "Environmental":
            return .cyan
        default:
            return .gray
        }
    }
}

struct CategoryButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.red : Color(.systemGray5))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(20)
        }
    }
}

struct FirstAidDetailView: View {
    let item: FirstAidItem
    @State private var showingShareSheet = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                HStack {
                    Image(systemName: item.icon)
                        .font(.system(size: 50))
                        .foregroundColor(.red)

                    VStack(alignment: .leading) {
                        Text(item.title)
                            .font(.title)
                            .fontWeight(.bold)
                        Text(item.category)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(.systemGroupedBackground))
                .cornerRadius(15)

                // Warning Banner
                if item.category == "Life-Threatening" {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.white)
                        Text("CALL EMERGENCY SERVICES IMMEDIATELY")
                            .font(.headline)
                            .foregroundColor(.white)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.red)
                    .cornerRadius(10)
                }

                // Steps
                VStack(alignment: .leading, spacing: 15) {
                    Text("Steps to Follow")
                        .font(.title2)
                        .fontWeight(.bold)

                    ForEach(Array(item.steps.enumerated()), id: \.offset) { index, step in
                        HStack(alignment: .top, spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(Color.red)
                                    .frame(width: 30, height: 30)
                                Text("\(index + 1)")
                                    .foregroundColor(.white)
                                    .fontWeight(.bold)
                            }

                            Text(step)
                                .font(.body)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(15)
                .shadow(radius: 2)

                // Warnings
                if !item.warnings.isEmpty {
                    VStack(alignment: .leading, spacing: 15) {
                        Text("⚠️ Important Warnings")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.orange)

                        ForEach(item.warnings, id: \.self) { warning in
                            HStack(alignment: .top, spacing: 10) {
                                Image(systemName: "exclamationmark.circle.fill")
                                    .foregroundColor(.orange)
                                Text(warning)
                                    .font(.body)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                    .padding()
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(15)
                }

                // Quick Actions
                VStack(spacing: 12) {
                    Button(action: {
                        callEmergency()
                    }) {
                        Label("Call Emergency Services", systemImage: "phone.fill")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .cornerRadius(10)
                    }

                    Button(action: {
                        showingShareSheet = true
                    }) {
                        Label("Share Instructions", systemImage: "square.and.arrow.up")
                            .font(.headline)
                            .foregroundColor(.blue)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(10)
                    }
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingShareSheet) {
            ShareSheet(items: [formatInstructionsForSharing()])
        }
    }

    private func callEmergency() {
        if let url = URL(string: "tel://911") {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            }
        }
    }

    private func formatInstructionsForSharing() -> String {
        var text = "🚨 \(item.title) - First Aid Instructions\n\n"
        text += "Steps:\n"
        for (index, step) in item.steps.enumerated() {
            text += "\(index + 1). \(step)\n"
        }
        text += "\n⚠️ Warnings:\n"
        for warning in item.warnings {
            text += "• \(warning)\n"
        }
        text += "\nShared from LifeGuard Emergency App"
        return text
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    FirstAidGuideView()
}
