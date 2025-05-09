import express from 'express';
import { ethers } from 'ethers';
import { connection } from '../sqlconnector.ts';
import dotenv from 'dotenv';
import { readFileSync } from "node:fs";
import process from "node:process";
dotenv.config();

const router = express.Router();

// Get ABI and contract address
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY!, provider);

const AdminsArtifact = JSON.parse(readFileSync('../Hardhat/artifacts/contracts/FinalProj.sol/Admins.json', 'utf-8'));
const adminsContract = new ethers.Contract(CONTRACT_ADDRESS, AdminsArtifact.abi, wallet);

// Route to add admin
router.post('/', async (req, res) => {
  try {
    const { adminWallets, adminName } = req.body;

    console.log('Received request to add admin:', { adminWallets, adminName });

    if (!adminWallets || !ethers.isAddress(adminWallets)) {
      console.error('Invalid or missing adminWallets. Must be a valid Ethereum address');
      return res.status(400).send('Invalid or missing adminWallets. Must be a valid Ethereum address.');
    }
    if (!adminName) {
      console.error('Missing adminName');
      return res.status(400).send('Admin name is required');
    }

    console.log(`Calling addAdmin function on smart contract with wallet: ${adminWallets}`);
    const tx = await adminsContract.addAdmin(adminWallets);
    console.log('Transaction sent, waiting for confirmation...');
    await tx.wait();
    console.log('Transaction confirmed, adding admin to database');

    connection.query('SELECT MAX(id) AS maxId FROM Admins', (err, results) => {
      if (err) {
        console.error('Error determining admin ID:', err);
        return res.status(500).send('Error determining admin ID');
      }

      const nextId = (results[0]?.maxId || 0) + 1;
      console.log(`Next admin ID determined: ${nextId}`);

      connection.query(
        'INSERT INTO Admins (id, adminWallets, adminName) VALUES (?, ?, ?)',
        [nextId, adminWallets, adminName],
        (err) => {
          if (err) {
            console.error('Error adding admin to database:', err);
            return res.status(500).send('Error adding admin to database');
          }
          console.log('Admin added to database successfully');
          res.status(201).send('Admin added successfully');
        }
      );
    });
  } catch (error) {
    console.error('Error adding admin to contract or database:', error);
    res.status(500).send('Error adding admin');
  }
});

export default router;
