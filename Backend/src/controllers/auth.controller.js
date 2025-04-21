import bcrypt from "bcryptjs"
import { db } from "../libs/db.js"
import { USerRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();
export const register = async(req , res) => {
    console.log("step 0");
    const {email , password , name} = req.body
    console.log("step 1");
    
    if(!email || !password || !name){
        return res.status(400).json({
            error: "Invalid field"
        })
    }
    try {
        const existingUSer = await db.User.findUnique({
            where:{
                email
            }
        })

        console.log(existingUSer);

        if(existingUSer){
            return res.status(400).json({
                error: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password , 10);

        const newUser = await db.User.create({
            data:{
                email,
                password: hashedPassword,
                name,
                role:USerRole.USER
            }
        })

        const token = jwt.sign({id:newUser.id} , process.env.JWT_SECRET , {
            expiresIn: "7d"
        })

        res.cookie("jwt" , token, {
            httpOnly : true,
            sameSite : "strict",
            secure:process.env.NODE_ENV !== "development",
            maxAge : 1000*60*60*24*7
        })

        res.status(201).json({
            user: {
                id:newUser.id,
                email:newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image
            }
        })
    } catch (error) {
        console.log("Error creating user:" , error);
        res.status(500).json({
            error:"Error creating user"
        })
           
    }

}
export const login = async(req , res) => {}
export const logout = async(req , res) => {}
export const check = async(req , res) => {}
