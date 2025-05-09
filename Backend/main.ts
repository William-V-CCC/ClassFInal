import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Import routes
import addAdmin from './Routes/addAdmin.ts';
import removeAdmin from './Routes/removeAdmin.ts';
import getEvents from './Routes/getEvents.ts';
import addEvent from './Routes/addEvent.ts';
import removeEvent from './Routes/removeEvent.ts';
import isAdmin from "./Routes/isAdmin.ts";
import getAdmin from "./Routes/getAdmin.ts";

const app = express();
app.use(cors());
app.use(express.json()); // To handle JSON requests

// Basic Request Logger Middleware
app.use((req: { method: any; originalUrl: any; }, res: any, next: () => void) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`);
  next(); // Call the next middleware or route handler
});

// Use the routes
app.use('/addAdmin', addAdmin);
app.use('/removeAdmin', removeAdmin);
app.use('/getEvents', getEvents);
app.use('/addEvent', addEvent);
app.use('/removeEvent', removeEvent);
app.use('/isAdmin', isAdmin);
app.use('/getAdmin', getAdmin);

// Set the server port
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
