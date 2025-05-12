import Foundation
import Combine

// MARK: - Data Model

struct Event: Identifiable, Decodable {
    let id: Int
    let location: String
    let time: String
    let description: String

    enum CodingKeys: String, CodingKey {
        case id
        case location = "eventLocation"
        case time = "eventTime"
        case description = "eventDescription"
    }
}

// MARK: - Data Loader

class DataLoader: ObservableObject {
    @Published var events: [Event] = []
    
    private var timer: Timer?
    
    init() {
        startPolling()
    }
    
    func getResult() async throws {
        let url = URL(string: "http://10.200.144.145:3003/getEvents")!
        
        do {
            print("[DataLoader] Fetching data from: \(url)")
            let (data, response) = try await URLSession.shared.data(from: url)
            
            if let httpResponse = response as? HTTPURLResponse {
                print("[DataLoader] Response code: \(httpResponse.statusCode)")
            }
            
            // Print raw JSON as string
            if let jsonString = String(data: data, encoding: .utf8) {
                print("[DataLoader] Raw JSON response:\n\(jsonString)")
            } else {
                print("[DataLoader] Unable to convert data to string.")
            }
            
            let decoder = JSONDecoder()
            let decodedEvents = try decoder.decode([Event].self, from: data)
            
            DispatchQueue.main.async {
                self.events = decodedEvents
                print("[DataLoader] Successfully decoded \(decodedEvents.count) events.")
            }
        } catch let decodingError as DecodingError {
            print("[DataLoader] Decoding failed:")
            switch decodingError {
            case .typeMismatch(let type, let context):
                print("Type mismatch for type \(type): \(context.debugDescription)")
            case .valueNotFound(let type, let context):
                print("Value not found for type \(type): \(context.debugDescription)")
            case .keyNotFound(let key, let context):
                print("Key '\(key.stringValue)' not found: \(context.debugDescription)")
            case .dataCorrupted(let context):
                print("Data corrupted: \(context.debugDescription)")
            @unknown default:
                print("Unknown decoding error.")
            }
            throw decodingError
        } catch {
            print("[DataLoader] General error: \(error.localizedDescription)")
            throw error
        }
    }
    
    
//    only reason this exists is for live feed updates its bad in production I know but its for display (major thanks to ai on this one)
    private func startPolling() {
        // Polling interval (every 10 seconds)
        timer = Timer.scheduledTimer(withTimeInterval: 10, repeats: true) { [weak self] _ in
            Task {
                do {
                    try await self?.getResult()
                } catch {
                    print("Failed to fetch data during polling: \(error)")
                }
            }
        }
    }
    
    deinit {
        // Stop polling when the instance is deallocated
        timer?.invalidate()
    }
}
