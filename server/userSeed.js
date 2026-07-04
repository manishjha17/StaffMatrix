import User from './models/User.js'
import bcrypt from 'bcrypt'
import connectToDatabase from './db/db.js'

const userRegister=async ()=>{
    connectToDatabase()
    try{
        const defaultEmail = process.env.DEFAULT_SUPERADMIN_EMAIL
        const defaultPassword = process.env.DEFAULT_SUPERADMIN_PASSWORD

        if (!defaultEmail || !defaultPassword) {
            throw new Error("Missing DEFAULT_SUPERADMIN_EMAIL or DEFAULT_SUPERADMIN_PASSWORD in environment variables");
        }

        const hashPassword=await bcrypt.hash(defaultPassword,10)
        const newUser=new User({
            name:"Super Admin",
            email: defaultEmail,
            password:hashPassword,
            role:"superadmin"
        })
        await newUser.save()
    } catch(error){
        console.log(error);
    }
}

userRegister();