import express from 'express';
import { connection } from "../sqlconnector.ts";

const router = express.Router();

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM Events WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).send('Error removing event');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Event not found');
    }

    res.send('Event removed successfully');
  });
});

export default router;
