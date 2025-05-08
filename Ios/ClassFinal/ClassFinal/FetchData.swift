import Foundation

class DataLoader: ObservableObject {
    @Published var events: [Event] = []
    
    // Fetches the data asynchronously
    func getResult() async throws {
        // Replace with your actual URL
        let url = URL(string: "http://localhost:3003")!
        
        // Perform the network request asynchronously
        let (data, response) = try await URLSession.shared.data(from: url)
        
        // Error handling for status code
        enum WebRequestError: Error {
            case codeRequestError
        }
        
        // Check if the response is valid
        guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
            throw WebRequestError.codeRequestError
        }
        
        // Decode the data into BaseResult
        let decoder = JSONDecoder()
        let result = try decoder.decode(BaseResult.self, from: data)
        
        // Update the events array with decoded data
        self.events = result.events
    }
}
