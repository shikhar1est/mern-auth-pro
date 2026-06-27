import express, { Application,Request, Response,NextFunction } from 'express';
import 'dotenv/config'; 
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/mongodb';
import authRouter from './routes/authRoutes';

//In JS/TS, 'import' statements are HOISTED to the top of the file, meaning they are processed before any other code is executed.
//That's why we removed 'dotenv/config' from the top of the file and placed it before the import statements. As a result,
//  the environment variables will be loaded before any other code is executed, ensuring that they are available for
//  use in the rest of the application.

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