import express from "express";
import dotenv from "dotenv";
import authRoutes  from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.use(express.json()) 
app.use(cookieParser());
const PORT = process.env.PORT;
app.listen(PORT ,() =>{
    console.log(`server is running on ${PORT}`)
})

app.get("/" , (req , res) => {
    res.send("Hello Guys Welcome to leetcode")
})

app.use("/api/v1/auth" , authRoutes)
