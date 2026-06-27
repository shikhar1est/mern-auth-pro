import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';
import transporter from '../config/nodemailer';


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

       //Welcome email to the user after successful registration
       const mailOptions={
        from:process.env.SENDER_EMAIL,
        to:email,
        subject:'Welcome to our app',
        text:'Hello ${name}, Thank you for registering with our app. Your account with email ${email} has been successfully created.'
       }
       await transporter.sendMail(mailOptions)

       return res.json({success:true,response:'User registered successfully'});
    }catch(error: any){
        res.json({success:false,message: error.message});
    }
}

export const login=async(req:Request,res:Response)=>{
    const {email,password}=req.body
    if(!email || !password){
        res.json({success:false,response:'All fields are required'})
    }
    try{
         const user=await userModel.findOne({email})
         if(!user){
            return res.json({success:false,response:'User does not exist'})
         }
         const isPasswordValid=await bcrypt.compare(password,user.password)
         if(!isPasswordValid){
            return res.json({success:false,response:'Invalid password'})
         }
         const secretKey=process.env.JWT_SECRET;
         if(!secretKey){
        return res.json({success:false,response:'JWT secret key is not defined'}); 
       }
       const token=jwt.sign({id:user._id},secretKey,{expiresIn:'1d'}); 
       res.cookie('token',token,{ 
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:process.env.NODE_ENV==='production'?
        'none':'strict', 
        maxAge: 7 * 24 * 60 * 60 * 1000
       })
       return res.json({success:true,response:'User logged in successfully'});
    }catch(error: any){
        res.json({success:false,message: error.message});
    }
}

export const logout=async(req:Request,res:Response)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:process.env.NODE_ENV==='production'?
        'none':'strict', 
        })
        return res.json({success:true,response:'Userlogged out successfully'})
    }catch(error: any){
        res.json({success:false,message:error.message})
    }
}

export const sendVerificationOTP=async(req:Request,res:Response)=>{
    try{
        const {userId}=req.body
        const user=await userModel.findById(userId)
        if(user.isAccountVerified){
            return res.json({success:false,response:'Account already verified'})
        }
        const otp=String(Math.floor(10000+Math.random()*90000))
        user.verifyOTP=otp
        user.verifyOTPExpiry=Date.now()+24*60*60*1000
        await user.save()

        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:'OTP Verification',
            text:'Your OTP for account verification is ${otp}. It will expire in 24 hours.'
        }
        transporter.sendMail(mailOptions)
        return res.json({success:true,response:'OTP sent to your email'})
    }catch(error: any){
        res.json({success:false,message:error.message})
    }
}

export const verifyEmail=async(req:Request,res:Response)=>{
    const {userId,otp}=req.body
    if(!userId || !otp){
        return res.json({success:false, response:'User ID and OTP are required'})
    }
    try{
        const user=await userModel.findById(userId)
        if(!user){
            return res.json({success:false,response:'User not found'})
        }
        if(user.verifyOTP==='' || user.verifyOTP!==otp){
            return res.json({success:false,response:'Invalid OTP'})
        }
        if(user.verifyOTPExpiry<Date.now()){
            return res.json({success:false,response:'OTP has expired'})
        }
        user.isAccountVerified=true,
        user.verifyOTP='',
        user.verifyOTPExpiry=0
        await user.save()
        return res.json({success:true,response:'Email verified successfully'})
    }catch(error:any){
        res.json({success:false,message:error.message})
    }
}