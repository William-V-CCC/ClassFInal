import express from "express";
import { connection } from "../sqlconnector.ts";

const router = express.Router();

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Get wallet address from the request body
  const { requesterWallet } = req.body; // Extract wallet address from request body
  
  console.log(`Received request to remove event with ID: ${id}`);
  
  if (!requesterWallet) {
    console.log('Error: Wallet address is required');
    return res.status(400).send('Wallet address is required');
  }

  console.log(`Verifying if wallet address ${requesterWallet} is an admin...`);

  // First, confirm if the user is an admin by calling the confirmAdmin route (assuming it returns a boolean)
  fetch(`http://localhost:3003/confirmAdmin/${requesterWallet}`)
    .then(response => response.json())
    .then(data => {
      console.log(`Admin verification result for ${requesterWallet}:`, data);

      if (!data.isAdmin) {
        console.log(`Unauthorized access attempt by ${requesterWallet}`);
        return res.status(403).send('Unauthorized: You are not an admin');
      }

      // If the user is an admin, proceed to remove the event
      console.log(`Proceeding to remove event with ID: ${id}`);

      connection.query('DELETE FROM Events WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error('Database error during event removal:', err);
          return res.status(500).send('Error removing event');
        }

        if (results.affectedRows === 0) {
          console.log(`Event with ID ${id} not found`);
          return res.status(404).send('Event not found');
        }

        console.log(`Event with ID ${id} removed successfully`);
        res.send('Event removed successfully');
      });
    })
    .catch(error => {
      console.error('Error checking admin status:', error);
      res.status(500).send('Error checking admin status');
    });
});

// Export the router
export default router;