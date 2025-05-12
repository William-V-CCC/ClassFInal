import express from 'express';
import { ethers, isAddress } from 'ethers';
import { connection } from '../sqlconnector.ts';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import process from "node:process";

dotenv.config();

const router = express.Router();

// Set up provider and wallet
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with actual deployed address
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY!, provider);

// Load contract ABI
const AdminsArtifact = JSON.parse(readFileSync('../Hardhat/artifacts/contracts/FinalProj.sol/Admins.json', 'utf-8'));
const adminsContract = new ethers.Contract(CONTRACT_ADDRESS, AdminsArtifact.abi, wallet);

// Route: POST /addAdmin
router.post('/', async (req, res) => {
  try {
    const { adminWallets, adminName, requesterWallet } = req.body;

    console.log('\n=== Incoming Add Admin Request ===');
    console.log('Admin Wallet:', adminWallets);
    console.log('Admin Name:', adminName);
    console.log('Requester Wallet:', requesterWallet);

    // Validate required fields
    if (!adminWallets || !adminName || !requesterWallet) {
      return res.status(400).json({ message: 'Missing required fields: adminWallets, adminName, or requesterWallet' });
    }

    // Validate Ethereum addresses
    if (!isAddress(adminWallets)) {
      return res.status(400).json({ message: 'Invalid adminWallets. Must be a valid Ethereum address.' });
    }

    if (!isAddress(requesterWallet)) {
      return res.status(400).json({ message: 'Invalid requesterWallet. Must be a valid Ethereum address.' });
    }

    // Verify requester is the Owner
    const requesterQuery = 'SELECT adminName FROM Admins WHERE adminWallets = ?';
    const requesterResult = await queryDatabase(requesterQuery, [requesterWallet]);

    if (requesterResult.length === 0 || requesterResult[0].adminName !== 'Owner') {
      return res.status(403).json({ message: 'Only the admin with adminName "Owner" can perform this action' });
    }

    // Check if the adminWallet already exists in the database
    const existingAdminQuery = 'SELECT * FROM Admins WHERE adminWallets = ?';
    const existingAdminResult = await queryDatabase(existingAdminQuery, [adminWallets]);

    if (existingAdminResult.length > 0) {
      return res.status(409).json({ message: 'An admin with the same wallet address already exists' });
    }

    // Check if the adminName is "Owner" and if it already exists in the database
    if (adminName === 'Owner') {
      const existingOwnerQuery = 'SELECT * FROM Admins WHERE adminName = ?';
      const existingOwnerResult = await queryDatabase(existingOwnerQuery, ['Owner']);

      if (existingOwnerResult.length > 0) {
        return res.status(409).json({ message: 'An admin with the name "Owner" already exists' });
      }
    }

    // Add admin to blockchain
    console.log(`📡 Calling addAdmin function on smart contract with wallet: ${adminWallets} and name: ${adminName}`);
    const tx = await adminsContract.addAdmin(adminWallets, adminName); // Pass both arguments
    console.log('📤 Transaction sent. Waiting for confirmation...');
    await tx.wait();
    console.log('✅ Transaction confirmed.');

    // Add admin to database
    const maxIdQuery = 'SELECT MAX(id) AS maxId FROM Admins';
    const maxIdResult = await queryDatabase(maxIdQuery);
    const nextId = (maxIdResult[0]?.maxId || 0) + 1;

    const insertQuery = 'INSERT INTO Admins (id, adminWallets, adminName) VALUES (?, ?, ?)';
    await queryDatabase(insertQuery, [nextId, adminWallets, adminName]);

    console.log('✅ Admin added successfully to database');
    return res.status(201).json({ message: 'Admin added successfully' });
  } catch (error) {
    console.error('🔥 Unexpected server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to query the database
function queryDatabase(query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}

export default router;