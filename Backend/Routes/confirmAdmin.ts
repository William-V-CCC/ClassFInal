import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { readFileSync } from "node:fs";
import { connection } from '../sqlconnector.ts'; // Import the SQL connector
dotenv.config();

const router = express.Router();
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const provider = new ethers.JsonRpcProvider('http://localhost:8545');

const AdminsArtifact = JSON.parse(readFileSync('../Hardhat/artifacts/contracts/FinalProj.sol/Admins.json', 'utf-8'));
const adminsContract = new ethers.Contract(CONTRACT_ADDRESS, AdminsArtifact.abi, provider);

// Route to check if a wallet is an admin and fetch events
router.get('/:wallet', async (req, res) => {
  const { wallet } = req.params;

  if (!wallet || !ethers.isAddress(wallet)) {
    return res.status(400).send('Invalid or missing wallet parameter');
  }

  try {
    // Check if the wallet is an admin on the blockchain
    const isAdmin = await adminsContract.isAdmin(wallet);

    if (!isAdmin) {
      return res.status(403).send('Wallet is not an admin');
    }

    // Fetch the list of events from the database
    connection.query("SELECT * FROM Events", (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error retrieving events');
      }

      res.json({ isAdmin, events: results });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error checking admin status or fetching events');
  }
});

export default router;