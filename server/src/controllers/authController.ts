import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';


export const register=async(req:Request,res:Response)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password){
        res.json({success:false,response:'All fields are required'});
    }
    try{
        const existingUser=await userModel.findOne({email});
        if(existingUser){
            return res.json({success:false,response:'User already exists'});
        }
       const hashedPassword=await bcrypt.hash(password,10);
       const user=new userModel({name,email,password:hashedPassword});
       await user.save();
       const secretKey=process.env.JWT_SECRET;
       if(!secretKey){
        return res.json({success:false,response:'JWT secret key is not defined'}); //Without the return statement,
        // the function would continue executing and could potentially cause unexpected behavior or errors.
       }
       const token=jwt.sign({id:user._id},secretKey,{expiresIn:'1d'}); //In this line, 
       //the jwt.sign() function is used to create a new JSON Web Token (JWT). 
       // The payload of the token includes the user's unique identifier (id) from the database. 
       // The secret key is used to sign the token, ensuring its integrity and authenticity. 
       // The token is set to expire in 1 day ('1d'), meaning it will no longer be valid after that time period.
       res.cookie('token',token,{ //This line sets a cookie named 'token' in the response.
        // The value of the cookie is the JWT token generated earlier.
        httpOnly:true, //This option ensures that the cookie cannot be accessed or modified by client-side JavaScript,
        // enhancing security by preventing cross-site scripting (XSS) attacks.
        secure:process.env.NODE_ENV==='production',//This option ensures that the cookie is only sent over HTTPS connections
        // when the application is running in a production environment.
        sameSite:process.env.NODE_ENV==='production'?
        'none':'strict', //This option controls how cookies are sent with cross-site requests.
        maxAge: 7 * 24 * 60 * 60 * 1000
       })
    }catch(error: any){
        res.json({success:false,message: error.message});
    }

}