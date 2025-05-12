import express from 'express';
import { ethers } from 'ethers';
import { connection } from "../sqlconnector.ts";
import dotenv from 'dotenv';
import { readFileSync } from "node:fs";
import process from "node:process";
dotenv.config();

const router = express.Router();

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY!, provider);

const AdminsArtifact = JSON.parse(readFileSync('../Hardhat/artifacts/contracts/FinalProj.sol/Admins.json', 'utf-8'));
const adminsContract = new ethers.Contract(CONTRACT_ADDRESS, AdminsArtifact.abi, wallet);

router.delete('/:wallet', async (req, res) => {
  const { wallet } = req.params;
  const { requesterWallet } = req.body; // Get the requesterWallet from the request body

  console.log(`Received request to remove admin with wallet: ${wallet}`);
  console.log(`Requester wallet: ${requesterWallet}`);

  if (!wallet || !ethers.isAddress(wallet)) {
    console.error('Invalid wallet address received');
    return res.status(400).send('Invalid or missing wallet parameter');
  }

  if (!requesterWallet || !ethers.isAddress(requesterWallet)) {
    console.error('Invalid or missing requester wallet');
    return res.status(400).send('Invalid or missing requester wallet');
  }

  // Check if the requesterWallet is an admin
  const resAdminCheck = await fetch(`http://localhost:3003/isAdmin/${requesterWallet}`);
  const dataAdminCheck = await resAdminCheck.json();
  if (!dataAdminCheck.isAdmin) {
    console.error('Requester is not an admin');
    return res.status(403).send('Requester is not an admin');
  }

  // Check if the admin being removed has the adminName of "Owner"
  connection.query('SELECT adminName FROM Admins WHERE adminWallets = ?', [wallet], (err, results) => {
    if (err) {
      console.error('Error querying adminName:', err);
      return res.status(500).send('Error querying adminName');
    }

    if (results.length > 0 && results[0].adminName === 'Owner') {
      console.error('Cannot remove admin with adminName "Owner"');
      return res.status(403).send('Cannot remove admin with adminName "Owner"');
    }

    // Proceed to remove the admin
    try {
      console.log(`Calling removeAdmin function on smart contract with wallet: ${wallet}`);
      adminsContract.removeAdmin(wallet).then(async (tx) => {
        console.log('Transaction sent, waiting for confirmation...');
        await tx.wait();
        console.log('Transaction confirmed, removing admin from database');

        connection.query('DELETE FROM Admins WHERE adminWallets = ?', [wallet], (err) => {
          if (err) {
            console.error('Error removing admin from database:', err);
            return res.status(500).send('Error removing admin from database');
          }
          console.log('Admin removed from database successfully');
          res.send('Admin removed successfully');
        });
      });
    } catch (error) {
      console.error('Error removing admin from contract or database:', error);
      res.status(500).send('Error removing admin');
    }
  });
});

export default router;