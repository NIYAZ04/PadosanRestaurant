import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt, { compare } from "bcrypt"
import validator from "validator"
import dotenv from 'dotenv';


// login user
const loginUser = async (req,res) => {
    const {email,password,userType, secretKey} = req.body;
    try {
        const user = await userModel.findOne({email});

        if (!user) {
            return res.json({success:false,message:"User Doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if (!isMatch) {
            return res.json({success:false,message:"Invalid credentials"})
        }

        if (user.userType === "Admin" ) {
            if(secretKey !== process.env.SECRET_KEY || email !== process.env.ADMIN_MAIL){
                return res.json({ success: false, message: "Invalid Admin Secret Key" });
            }
        }

        const token = createToken(user._id);
        res.json({success:true,token, userType: user.userType})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET)
}

// register user
const registerUser = async (req,res) => {
    const {name,password,email,userType, secretKey} = req.body;
    try{
        //checking if user already exists
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({success:false,message:"User already exists"})
        }

        //validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Please enter a valid email"})
        }

        if (password.length<8){
            return res.json({success:false,message:"Please enter a strong password"})
        }
        //checking if valid admin
        if (userType === "Admin" && secretKey !== process.env.SECRET_KEY) {
            return res.json({ success: false, message: "Invalid Admin Secret Key" });
        }
        

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword,
            userType: userType,
        });

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token, userType: user.userType});

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
};

export {loginUser,registerUser};