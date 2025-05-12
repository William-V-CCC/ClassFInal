"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAdminName, setNewAdminName] = useState("");

  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    eventLocation: "",
    eventDescription: "",
    eventTime: "",
  });
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [newAdminWallet, setNewAdminWallet] = useState("");
  const [removeAdminWallet, setRemoveAdminWallet] = useState("");
  const [admins, setAdmins] = useState([]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const connectWallet = async () => {
      if ((window as any).ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const wallet = accounts[0];
          setWalletAddress(wallet);

          const res = await fetch(`${BASE_URL}/isAdmin/${wallet}`);
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        } catch (err) {
          alert("Failed to connect to MetaMask.");
        } finally {
          setLoading(false);
        }
      } else {
        alert("MetaMask not detected. Please install MetaMask.");
        setLoading(false);
      }
    };

    connectWallet();
  }, [BASE_URL]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${BASE_URL}/getAdmin`)
      .then((response) => response.json())
      .then((data) => setAdmins(data))
      .catch(() => alert("Error fetching admins."));
  }, [isAdmin, BASE_URL]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${BASE_URL}/getEvents`)
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch(() => alert("Error fetching events."));
  }, [isAdmin, BASE_URL]);

  const handleAddAdmin = () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    const payload = {
      adminWallets: newAdminWallet,
      adminName: newAdminName,
      requesterWallet: walletAddress,
    };

    fetch(`${BASE_URL}/addAdmin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (res.ok) {
          alert("Admin added successfully.");
          setNewAdminWallet("");
          setNewAdminName("");
        } else {
          const errorMsg = await res.text();
          alert(`Failed to add admin: ${errorMsg}`);
        }
      })
      .catch(() => alert("Error adding admin."));
  };

  const handleRemoveAdmin = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!removeAdminWallet) {
      alert("Please provide a wallet address to remove.");
      return;
    }

    const confirmRes = await fetch(`${BASE_URL}/confirmAdmin/${walletAddress}`);
    const confirmData = await confirmRes.json();

    if (!confirmData.isAdmin) {
      alert("You are not authorized to remove an admin.");
      return;
    }

    fetch(`${BASE_URL}/removeAdmin/${removeAdminWallet}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requesterWallet: walletAddress }),
    })
      .then((res) => {
        if (res.ok) {
          alert("Admin removed successfully.");
          setRemoveAdminWallet("");
        } else {
          alert("Failed to remove admin.");
        }
      })
      .catch(() => alert("Error removing admin."));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    const eventWithAdmin = {
      ...newEvent,
      adminWallet: walletAddress,
    };

    fetch(`${BASE_URL}/addEvent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventWithAdmin),
    })
      .then((response) => {
        if (response.ok) {
          setNewEvent({
            eventLocation: "",
            eventDescription: "",
            eventTime: "",
          });
          fetch(`${BASE_URL}/getEvents`)
            .then((res) => res.json())
            .then((data) => setEvents(data));
        } else {
          alert("Failed to add event.");
        }
      })
      .catch(() => alert("Error adding event."));
    alert("Event added successfully.");
  };

  const handleRemoveEvent = (id: number) => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    fetch(`${BASE_URL}/removeEvent/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requesterWallet: walletAddress }),
    })
      .then((response) => {
        if (response.ok) {
          fetch(`${BASE_URL}/getEvents`)
            .then((res) => res.json())
            .then((data) => setEvents(data));
        } else {
          alert("Failed to remove event.");
        }
      })
      .catch(() => alert("Error removing event."));
    alert("Event removed successfully.");
  };

  const toggleDescription = (id: number) => {
    setExpandedEventId((prevId) => (prevId === id ? null : id));
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access denied: You are not an admin.</div>;

  return (
    <div className={styles.page}>
      {/* Coconut Image with error handler */}
      <img
        src="/Nut.png"
        alt="Coconut"
        className={styles.coconutImage}
        onError={() => {
          // Redirect the user to Google's homepage if the image fails to load
          window.location.href = "https://www.google.com";
        }}
      />

      <div className={styles.header}>
        <h1>Admin Panel</h1>
      </div>

      <div className={styles.EventList}>
        <h2>Event List</h2>
        <ul>
          {events.map((event: any) => (
            <li key={event.id} className={styles.eventItem}>
              <div className={styles.eventContent}>
                <div
                  onClick={() =>
                    toggleDescription(event.id)}
                  className={styles.eventDetails}
                >
                  <strong>{event.eventLocation}</strong> - {event.eventTime}
                </div>
                <button
                  onClick={() =>
                    handleRemoveEvent(event.id)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
              {expandedEventId === event.id && (
                <p className={styles.eventDescription}>
                  {event.eventDescription}
                </p>
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

      <div className={styles.addAdminSection}>
        <h2>Add Admin</h2>
        <input
          type="text"
          placeholder="Admin Name"
          autoComplete="off"
          value={newAdminName}
          onChange={(e) => setNewAdminName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Admin Wallet Address"
          autoComplete="off"
          value={newAdminWallet}
          onChange={(e) => setNewAdminWallet(e.target.value)}
        />
        <button onClick={handleAddAdmin}>Add Admin</button>
      </div>

      <div className={styles.removeAdminSection}>
        <h2>Remove Admin Wallet</h2>
        <input
          type="text"
          placeholder="Admin Wallet Address"
          autoComplete="off"
          value={removeAdminWallet}
          onChange={(e) => setRemoveAdminWallet(e.target.value)}
        />
        <button onClick={handleRemoveAdmin}>Remove Admin</button>
      </div>

      <div className={styles.adminListSection}>
        <h2>Current Admins</h2>
        <ul>
          {admins.map((admin: any, index) => (
            <li key={index}>
              <strong>{admin.adminName}</strong> - {admin.adminWallets}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
