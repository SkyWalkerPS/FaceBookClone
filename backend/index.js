import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import connectDatabase from "./utils/db.js"
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import messageRoute from "./routes/message.route.js"
import { server,app,io } from "./socket/socket.js"
import path from "path";

try {
    dotenv.config({})

    const __dirname = path.resolve();

    app.use(express.json())
    app.use(cookieParser())
    app.use(urlencoded({extended:true}))

    const corsOption = {
        origin: process.env.URL,
        credentials:true
    }
    app.use(cors(corsOption))

    // Routes setup
    try {
        app.use("/api/v1/user",userRoute)
        app.use("/api/v1/post",postRoute)
        app.use("/api/v1/message",messageRoute)

        app.use(express.static(path.join(__dirname,"/frontend/dist")))
        app.get("*",(req,res)=>{
            try {
                res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"));
            } catch (error) {
                console.error("Error serving frontend:", error)
                res.status(500).send("Error serving frontend files")
            }
        })
    } catch (error) {
        console.error("Error setting up routes:", error)
        process.exit(1)
    }

    const PORT = process.env.PORT
    server.listen(PORT, async () => {
        await connectDatabase();
        console.log(`Server listening at port ${PORT}`);
    })

} catch (error) {
    console.error("Fatal error during app initialization:", error)
    process.exit(1)
}
