import express from "npm:express";
import { connection } from "./sqlconnector.ts"; // Import the SQL connector
import cors from "npm:cors"; // Import CORS middleware
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request bodies

// Route to get all events
app.get("/getEvents", (req, res) => {
  connection.query("SELECT * FROM Events", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving events");
    }
    res.json(results);
  });
});

// Route to add a new event
app.post("/addEvent", (req, res) => {
  const { eventLocation, eventDescription, eventTime } = req.body;

  if (!eventLocation || !eventDescription || !eventTime) {
    return res.status(400).send("Missing required fields");
  }

  // Determine the highest ID in the table
  connection.query("SELECT MAX(id) AS maxId FROM Events", (err, results: { maxId: number }[]) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error determining event ID");
    }

    const nextId = (results[0]?.maxId || 0) + 1; // If no rows exist, start with ID 1

    connection.query(
      "INSERT INTO Events (id, eventLocation, eventDescription, eventTime) VALUES (?, ?, ?, ?)",
      [nextId, eventLocation, eventDescription, eventTime],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding event");
        }
        res.status(201).send("Event added successfully");
      }
    );
  });
});

// Route to remove an event by ID
app.delete("/removeEvent/:id", (req, res) => {
  const { id } = req.params;

  connection.query("DELETE FROM Events WHERE id = ?", [id], (err, results: any) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error removing event");
    }

    if (results && (results as any).affectedRows === 0) {
      return res.status(404).send("Event not found");
    }

    res.send("Event removed successfully");
  });
});


// Route to get all admins
app.get("/getAdmin", (req, res) => {
  connection.query("SELECT * FROM Admins", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving admins");
    }
    res.json(results);
  });
});

// Route to add a new admin
app.post("/addAdmin", (req, res) => {
  const { adminWallets } = req.body;

  if (!adminWallets) {
    return res.status(400).send("Missing required fields");
  }

  // Determine the highest ID in the table
  connection.query("SELECT MAX(id) AS maxId FROM Admins", (err, results: { maxId: number }[]) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error determining admin ID");
    }

    const nextId = (results[0]?.maxId || 0) + 1; // If no rows exist, start with ID 1

    connection.query(
      "INSERT INTO Admins (id, adminWallets) VALUES (?, ?)",
      [nextId, adminWallets],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error adding admin");
        }
        res.status(201).send("Admin added successfully");
      }
    );
  });
});

// Route to remove an admin by ID
app.delete("/removeAdmin/:id", (req, res) => {
  const { id } = req.params;

  connection.query("DELETE FROM Admins WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error removing admin");
    }

    if (results && (results as any).affectedRows === 0) {
      return res.status(404).send("Admin not found");
    }

    res.send("Admin removed successfully");
  });
});












app.listen(3003, () => {
  console.log("Listening on port 3003");
});

