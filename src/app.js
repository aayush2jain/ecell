import express, { urlencoded } from "express";
import { Cookie } from "express-session";
import cookieParser from 'cookie-parser'
import cors from 'cors'
import bodyParser from "body-parser";

const app=express();

app.use(cors({
  origin: ['https://ecellfrontend-5q7u.vercel.app','https://esummit.ecelldtu.in', 'http://localhost:3000','https://www.ecelldtu.in','https://ecell-dtu-official-eta.vercel.app'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());

import userrouter from './routes/userRoute.js'
import orderRouter from './routes/orderRoute.js'
import visitorRouter from './routes/visitorRoute.js'
app.use('/user',userrouter);
app.use('/payment',orderRouter);
app.use('/visitor',visitorRouter);
app.get('/',async (req,res)=>{
    res.status(200).json({message:"server is running on "})
})
export {app}