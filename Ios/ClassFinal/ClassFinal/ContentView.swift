import SwiftUI
// No need to import FetchData or DefinedData

struct ContentView: View {
    @StateObject private var dataLoader = DataLoader() // DataLoader from FetchData folder
    @State private var selectedEventId: UUID? = nil // To track the selected event
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(alignment: .leading, spacing: 16) {
                Spacer()
                
                // Lighter gray box with two labels inside
                ZStack {
                    Color(red: 0.63, green: 0.63, blue: 0.63) // Light gray background
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

                        // Dynamically display the data once it's fetched
                        if dataLoader.events.isEmpty {
                            Text("Loading...")
                                .foregroundColor(.black)
                        } else {
                            ScrollView {
                                VStack {
                                    ForEach(dataLoader.events) { event in
                                        VStack {
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
                                                // Toggle the selected event
                                                if selectedEventId == event.id {
                                                    selectedEventId = nil // Deselect if clicked again
                                                } else {
                                                    selectedEventId = event.id // Select the event
                                                }
                                            }
                                            
                                            // Display the description if this event is selected
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
            
            // Gray header bar
            VStack(spacing: 0) {
                Color(red: 0.545, green: 0.545, blue: 0.545)
                    .frame(height: 100)
                    .ignoresSafeArea(edges: .top)
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        }
        .onAppear {
            // Fetch data when the view appears
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
