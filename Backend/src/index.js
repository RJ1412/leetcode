import express from "express";
import dotenv from "dotenv";
import authRoutes  from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import problemRoutes from "./routes/problem.routes.js";
import executionRoute from "./routes/executeCode.routes.js";
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
app.use("/api/v1/problems" , problemRoutes)
app.use("/api/v1/execute-code" ,executionRoute)