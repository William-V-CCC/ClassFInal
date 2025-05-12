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
    const { adminWallets, adminName, requesterWallet } = req.body;

    console.log('Received request to add admin:', { adminWallets, adminName, requesterWallet });

    if (!adminWallets || !ethers.isAddress(adminWallets)) {
      console.error('Invalid or missing adminWallets. Must be a valid Ethereum address');
      return res.status(400).send('Invalid or missing adminWallets. Must be a valid Ethereum address.');
    }
    if (!adminName) {
      console.error('Missing adminName');
      return res.status(400).send('Admin name is required');
    }

    if (!requesterWallet || !ethers.isAddress(requesterWallet)) {
      console.error('Invalid or missing requesterWallet');
      return res.status(400).send('Invalid or missing requesterWallet');
    }

    // Check if the requester is an admin on the blockchain
    console.log(`Checking if ${requesterWallet} is an admin...`);
    const isAdmin = await adminsContract.isAdmin(requesterWallet);
    if (!isAdmin) {
      console.error('Requester wallet is not an admin:', requesterWallet);
      return res.status(403).send('Requester is not an admin on the blockchain');
    }

    // Check if the adminName is "Owner" and if it already exists in the database
    if (adminName === 'Owner') {
      console.log('Checking if an admin with the name "Owner" already exists...');
      connection.query('SELECT * FROM Admins WHERE adminName = ?', ['Owner'], (err, results) => {
        if (err) {
          console.error('Error checking for existing "Owner" admin:', err);
          return res.status(500).send('Error checking for existing "Owner" admin');
        }

        if (results.length > 0) {
          console.error('An admin with the name "Owner" already exists');
          return res.status(403).send('An admin with the name "Owner" already exists');
        }

        // Proceed to add the admin
        addAdminToBlockchainAndDatabase(adminWallets, adminName, res);
      });
    } else {
      // Proceed to add the admin if the name is not "Owner"
      addAdminToBlockchainAndDatabase(adminWallets, adminName, res);
    }
  } catch (error) {
    console.error('Error adding admin to contract or database:', error);
    res.status(500).send('Error adding admin');
  }
});

// Helper function to add admin to blockchain and database
async function addAdminToBlockchainAndDatabase(adminWallets, adminName, res) {
  try {
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
    console.error('Error adding admin to blockchain or database:', error);
    res.status(500).send('Error adding admin');
  }
}

export default router;