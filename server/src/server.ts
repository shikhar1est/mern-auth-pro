import express, { Application,Request, Response,NextFunction } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/mongodb';

dotenv.config();

const app=express();
const port=process.env.PORT || 5000
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true})); 
app.get('/',(req,res)=>{
    res.send('Hello World!');
})
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})