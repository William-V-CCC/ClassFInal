import Foundation

// The BaseResult model that contains an array of events
struct BaseResult: Codable {
    var events: [Event]
}
