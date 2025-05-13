import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { readFileSync } from "node:fs";
dotenv.config();

const router = express.Router();
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

const AdminsArtifact = JSON.parse(readFileSync('../Hardhat/artifacts/contracts/FinalProj.sol/Admins.json', 'utf-8'));
const adminsContract = new ethers.Contract(CONTRACT_ADDRESS, AdminsArtifact.abi, provider);

router.get('/:wallet', async (req, res) => {
  const { wallet } = req.params;

  if (!wallet || !ethers.isAddress(wallet)) {
    return res.status(400).send('Invalid or missing wallet parameter');
  }

  try {
    const isAdmin = await adminsContract.isAdmin(wallet);
    res.json({ isAdmin });
  } catch (error) {
    res.status(500).send('Error checking admin status');
  }
});

export default router;
