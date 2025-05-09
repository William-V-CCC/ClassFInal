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

  console.log(`Received request to remove admin with wallet: ${wallet}`);

  if (!wallet || !ethers.isAddress(wallet)) {
    console.error('Invalid wallet address received');
    return res.status(400).send('Invalid or missing wallet parameter');
  }

  try {
    console.log(`Calling removeAdmin function on smart contract with wallet: ${wallet}`);
    const tx = await adminsContract.removeAdmin(wallet);
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
  } catch (error) {
    console.error('Error removing admin from contract or database:', error);
    res.status(500).send('Error removing admin');
  }
});

export default router;
