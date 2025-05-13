import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors());

// Import routes
import addAdmin from './Routes/addAdmin.ts';
import removeAdmin from './Routes/removeAdmin.ts';
import getEvents from './Routes/getEvents.ts';
import addEvent from './Routes/addEvent.ts';
import removeEvent from './Routes/removeEvent.ts';
import getAdmin from "./Routes/getAdmin.ts";
import isAdmin from "./Routes/isAdmin.ts";
import confirmAdmin from "./Routes/confirmAdmin.ts";
import { ethers } from 'ethers';
import { connection } from './sqlconnector.ts';
import { readFileSync } from "node:fs";
import process from "node:process";

// Apply JSON middleware globally
app.use(express.json());

// Get ABI and contract address
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Contract address after deployment
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY!, provider);

const AdminsArtifact = JSON.parse(readFileSync('../Hardhat/artifacts/contracts/FinalProj.sol/Admins.json', 'utf-8'));
const adminsContract = new ethers.Contract(CONTRACT_ADDRESS, AdminsArtifact.abi, wallet);

// Add the deployer (msg.sender) to the database as the "Owner"
async function addOwnerToDatabase() {
  try {
    console.log('Adding contract deployer (msg.sender) to database as "Owner"...');

    // Get deployer's address
    const deployerAddress = await wallet.getAddress();
    console.log('Deployer address:', deployerAddress);

    // Check if the deployer already exists in the database
    const walletCheckQuery = 'SELECT * FROM Admins WHERE adminWallets = ?';
    connection.query(walletCheckQuery, [deployerAddress], (err, results) => {
      if (err) {
        console.error('Error checking if deployer exists in the database:', err);
        return;
      }

      if (results.length === 0) {
        // Deployer doesn't exist, insert into database as "Owner"
        const nextId = 0;  // Owner's ID is 0
        const adminName = "Owner";
        console.log('Adding deployer as Owner with ID:', nextId);

        connection.query(
          'INSERT INTO Admins (id, adminWallets, adminName) VALUES (?, ?, ?)',
          [nextId, deployerAddress, adminName],
          (err) => {
            if (err) {
              console.error('Error adding deployer to database:', err);
            } else {
              console.log('Deployer added to the database successfully as Owner');
            }
          }
        );
      } else {
        console.log('Deployer already exists in the database. Skipping insertion.');
      }
    });
  } catch (error) {
    console.error('Error in adding deployer to database:', error);
  }
}

// Call addOwnerToDatabase during startup
addOwnerToDatabase();

// Use the routes
app.use('/addAdmin', addAdmin);
app.use('/removeAdmin', removeAdmin);
app.use('/getEvents', getEvents);
app.use('/addEvent', addEvent);
app.use('/removeEvent', removeEvent);
app.use('/isAdmin', isAdmin);
app.use('/getAdmin', getAdmin);
app.use('/confirmAdmin', confirmAdmin);

// Debugging middleware (moved after routes)
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Set the server port
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});