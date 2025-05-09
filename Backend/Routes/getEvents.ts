import express from 'express';
import { connection } from "../sqlconnector.ts";

const router = express.Router();

router.get('/', (req, res) => {
  connection.query('SELECT * FROM Events', (err, results) => {
    if (err) {
      return res.status(500).send('Error retrieving events');
    }
    res.json(results);
  });
});

export default router;
