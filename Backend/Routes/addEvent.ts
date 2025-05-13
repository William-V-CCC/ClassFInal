import express from 'express';
import { connection } from "../sqlconnector.ts";
import axios from 'axios';  // Import axios for making HTTP requests

const router = express.Router();

router.post('/', async (req, res) => {
  const { eventLocation, eventDescription, eventTime, adminWallet } = req.body;

  console.log('Received request to add event:', { eventLocation, eventDescription, eventTime, adminWallet });

  // Check for missing fields
  if (!eventLocation || !eventDescription || !eventTime || !adminWallet) {
    console.warn('Missing required fields:', { eventLocation, eventDescription, eventTime, adminWallet });
    return res.status(400).send('Missing required fields');
  }

  try {
    // Call the /confirmAdmin route to verify if the wallet is an admin
    const adminCheckResponse = await axios.get(`http://localhost:3003/confirmAdmin/${adminWallet}`);

    if (adminCheckResponse.status !== 200) {
      console.warn('Wallet is not an admin:', adminWallet);
      return res.status(403).send('Wallet is not an admin');
    }

    // Get the maximum event ID from the database and increment it by 1
    console.log('Fetching the highest event ID from the database...');
    connection.query('SELECT MAX(id) AS maxId FROM Events', (err, results) => {
      if (err) {
        console.error('Error fetching max event ID:', err);
        return res.status(500).send('Error fetching max event ID');
      }

      const newEventId = results[0].maxId ? results[0].maxId + 1 : 1; // Start from 1 if no events exist
      console.log('Generated new event ID:', newEventId);

      // Insert the new event into the Events table
      console.log('Inserting new event into the database...');
      connection.query(
        'INSERT INTO Events (id, eventLocation, eventDescription, eventTime, adminWallets) VALUES (?, ?, ?, ?, ?)',
        [newEventId, eventLocation, eventDescription, eventTime, adminWallet],
        (err) => {
          if (err) {
            console.error('Error adding event to the database:', err);
            return res.status(500).send('Error adding event');
          }
          console.log('Event added successfully:', { newEventId, eventLocation, eventDescription, eventTime, adminWallet });
          res.status(201).send('Event added successfully');
        }
      );
    });
  } catch (error) {
    console.error('Error verifying admin or processing event:', error);
    res.status(500).send('Error verifying admin or processing event');
  }
});

export default router;
