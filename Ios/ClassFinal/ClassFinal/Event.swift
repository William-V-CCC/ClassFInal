import Foundation

// The Event model with a description
struct Event: Identifiable, Codable {
    var id = UUID() // Unique identifier for each event
    var location: String
    var time: String
    var description: String // Add a description field
}
