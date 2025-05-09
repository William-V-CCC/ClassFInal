import express from 'express';
import { connection } from "../sqlconnector.ts";

const router = express.Router();

router.get('/', (req, res) => {
  connection.query('SELECT adminWallets, adminName FROM Admins', (err, results) => {
    if (err) {
      return res.status(500).send('Error retrieving admins');
    }
    res.json(results); // Ensure both wallet and name are returned
  });
});

export default router;
