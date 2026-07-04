import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: false },
    name:{type:String , required:true},
    email:{type:String , required:true},
    password:{type:String , required:true},
    role:{type:String , enum:["superadmin","admin","employee"],required:true},
    profileImage:{type:String},
    createdAt:{type:Date ,default: Date.now},
    updatedAt:{type:Date ,default: Date.now},
})

const User=mongoose.model("User",userSchema)
export default User