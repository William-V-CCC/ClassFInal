"use client"
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    eventLocation: "",
    eventDescription: "",
    eventTime: "",
  });
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null); // Track which event is expanded

  // Fetch events from the backend
  useEffect(() => {
    fetch("http://localhost:3003/getEvents")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  // Handle input changes for the new event
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  // Submit a new event to the backend
  const handleAddEvent = () => {
    fetch("http://localhost:3003/addEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    })
      .then((response) => {
        if (response.ok) {
          
        
          setNewEvent({ eventLocation: "", eventDescription: "", eventTime: "" });
          // Refresh the event list
          return fetch("http://localhost:3003/getEvents")
            .then((res) => res.json())
            .then((data) => setEvents(data));
        } else {
          alert("Failed to add event");
        }
      })
      .catch((error) => console.error("Error adding event:", error));
  };

  // Remove an event by ID
  const handleRemoveEvent = (id: number) => {
    fetch(`http://localhost:3003/removeEvent/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          // Refresh the event list
          return fetch("http://localhost:3003/getEvents")
            .then((res) => res.json())
            .then((data) => setEvents(data));
        } else {
          alert("Failed to remove event");
        }
      })
      .catch((error) => console.error("Error removing event:", error));
  };

  // Toggle the description visibility for an event
  const toggleDescription = (id: number) => {
    setExpandedEventId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Admin Panel</h1>
      </div>

      <div className={styles.EventList}>
        <h2>Event List</h2>
        <ul>
          {events.map((event: any) => (
            <li key={event.id} className={styles.eventItem}>
              <div className={styles.eventContent}>
                <div onClick={() => toggleDescription(event.id)} className={styles.eventDetails}>
                  <strong>{event.eventLocation}</strong> - {event.eventTime}
                </div>
                <button
                  onClick={() => handleRemoveEvent(event.id)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
              {expandedEventId === event.id && (
                <p className={styles.eventDescription}>{event.eventDescription}</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.addAEvent}>
        <h2>Add an Event</h2>
        <input
          type="text"
          name="eventLocation"
          placeholder="Event Location"
          autoComplete="off"
          value={newEvent.eventLocation}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="eventDescription"
          placeholder="Event Description"
          autoComplete="off"
          value={newEvent.eventDescription}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="eventTime"
          placeholder="Event Time"
          autoComplete="off"
          value={newEvent.eventTime}
          onChange={handleInputChange}
        />
        <button onClick={handleAddEvent}>Submit</button>
      </div>
    </div>
  );
}