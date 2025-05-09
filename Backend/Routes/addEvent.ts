import express from 'express';
import { connection } from "../sqlconnector.ts";

const router = express.Router();

router.post('/', (req, res) => {
  const { eventLocation, eventDescription, eventTime } = req.body;

  if (!eventLocation || !eventDescription || !eventTime) {
    return res.status(400).send('Missing required fields');
  }

  connection.query('SELECT MAX(id) AS maxId FROM Events', (err, results) => {
    if (err) {
      return res.status(500).send('Error determining event ID');
    }

    const nextId = (results[0]?.maxId || 0) + 1;

    connection.query(
      'INSERT INTO Events (id, eventLocation, eventDescription, eventTime) VALUES (?, ?, ?, ?)',
      [nextId, eventLocation, eventDescription, eventTime],
      (err) => {
        if (err) {
          return res.status(500).send('Error adding event');
        }
        res.status(201).send('Event added successfully');
      }
    );
  });
});

export default router;
