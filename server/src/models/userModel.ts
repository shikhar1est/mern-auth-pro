import mongoose from 'mongoose';

//A schema is a blueprint for the structure of documents in a MongoDB collection.
//It defines the fields, their data types, and any validation rules or constraints that should be applied to the data.
const userSchema=new mongoose.Schema({ 
    name:{type:String, required:true},
    email:{type:String,required:true, unique:true},
    password:{type:String,required:true},
    verifyOTP:{type:String,default:''},
    verifyOTPExpiry:{type:Number,default:0},
    isAccountVerified:{type:Boolean,default:false},
    resetOTP:{type:String,default:''},
    resetOTPExpiry:{type:Number,default:0},
})

const userModel=mongoose.models.User || mongoose.model('User',userSchema); //This line checks if a 
//model named 'User' already exists in the mongoose.models object. If it does, it uses that existing model.
//  If not, it creates a new model using the userSchema and assigns it to the userModel variable.
export default userModel;