import SwiftUI

struct ContentView: View {
    @StateObject private var dataLoader = DataLoader() // DataLoader from FetchData
    @State private var selectedEventId: Int? = nil // Changed UUID to Int to match Event model

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(alignment: .leading, spacing: 16) {
                Spacer()

                // Lighter gray box with two labels inside
                ZStack {
                    Color(red: 0.63, green: 0.63, blue: 0.63)
                        .cornerRadius(8)

                    VStack {
                        HStack {
                            Text("Location")
                                .foregroundColor(.black)
                                .font(.headline)
                            Spacer()
                            Text("Time")
                                .foregroundColor(.black)
                                .font(.headline)
                        }
                        .padding()

                        if dataLoader.events.isEmpty {
                            Text("Loading...")
                                .foregroundColor(.black)
                        } else {
                            ScrollView {
                                VStack(spacing: 8) {
                                    ForEach(dataLoader.events) { event in
                                        VStack(alignment: .leading, spacing: 4) {
                                            HStack {
                                                Text(event.location)
                                                    .foregroundColor(.black)
                                                    .font(.body)
                                                Spacer()
                                                Text(event.time)
                                                    .foregroundColor(.black)
                                                    .font(.body)
                                            }
                                            .padding()
                                            .background(RoundedRectangle(cornerRadius: 8).stroke(Color.gray))
                                            .onTapGesture {
                                                if selectedEventId == event.id {
                                                    selectedEventId = nil
                                                } else {
                                                    selectedEventId = event.id
                                                }
                                            }

                                            if selectedEventId == event.id {
                                                Text(event.description)
                                                    .foregroundColor(.black)
                                                    .padding()
                                                    .background(Color.white.opacity(0.8))
                                                    .cornerRadius(8)
                                                    .transition(.slide)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        Spacer()
                    }
                }
                .frame(height: 650)

                Spacer()
            }
            .padding(.horizontal)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)

            // Header bar
            VStack(spacing: 0) {
                Color(red: 0.545, green: 0.545, blue: 0.545)
                    .frame(height: 100)
                    .ignoresSafeArea(edges: .top)
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        }
        .onAppear {
            Task {
                do {
                    try await dataLoader.getResult()
                } catch {
                    print("Failed to load data: \(error)")
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
