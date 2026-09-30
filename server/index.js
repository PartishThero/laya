import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors'

dotenv.config()
const app = express()
const port = 8002

app.use(cors({
    origin: "https://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send('Hello from server')
})

mongoose.connect(process.env.DBuri)
  .then(() => {
    console.log('DB connected')
  })
  .catch((err) => {
    console.log(err)
  })

app.listen(port, () => {
  console.log(`Hello from server ${port}`)
})
