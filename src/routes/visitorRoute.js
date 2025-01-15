import { Router } from "express";
import Visitor from "../models/visitor.model.js";
const router = Router();
router.post('/',async (req,res)=>{
  const { name,college,city,email,contact,gender } = req.body;
  try{
     const registeredUser = Visitor.findOne({email:email})
     if(registeredUser){
        return res.send("You have already applied")
     }

     const visitor = new Visitor({
    name,
    college,
    city,
    email,
    contact,
    gender,
     }
     )
     const newvisitor  = await visitor.save();
     if(newvisitor){
        return res.status(200).json({ mesaage:"You have sucessessfully register"})
     }
     else{
        return res.status(500).json({message:"something went wrong"})
     }
  }
catch(error){
    return res.status(500).json({message:"not able to register"})
}
})

export default router;