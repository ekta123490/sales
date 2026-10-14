import 'dotenv/config';
import express from 'express';
import cors from 'cors';


import customerRoutes from './routes/customers.js';
import authRoutes from './routes/authroutes.js';


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('hello world');
});

app.use('/api/records', customerRoutes);
app.use('/api/auth', authRoutes);


app.listen(5000, () => {
    console.log('Server running on port 5000');
});

console.log('Current directory:', process.cwd());
console.log("FRONTEND_URL loaded:", !!process.env.FRONTEND_URL);
console.log('JWT secret loaded:', !!process.env.JWT_SECRET);