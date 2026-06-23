import express, { Application,Request, Response,NextFunction } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/mongodb';
import authRouter from './routes/authRoutes';

dotenv.config();

const app=express();
const port=process.env.PORT || 5000
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true})); 
//API Endpoints
app.get('/',(req,res)=>{
    res.send('Hello World!');
})
app.use('/api/auth',authRouter)
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})