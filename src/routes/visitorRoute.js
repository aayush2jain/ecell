import { Router } from "express";
import Visitor from "../models/visitor.model.js";
const router = Router();
router.post('/', async (req, res) => {
  const { name, college, city, email, contact, gender } = req.body;

  // Validate input fields
  if (!name || !college || !city || !email || !contact || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create a new visitor
    const visitor = new Visitor({
      name,
      college,
      city,
      email,
      contact,
      gender,
    });

    // Save the visitor to the database
    const newVisitor = await visitor.save();

    if (newVisitor) {
      return res.status(200).json({ message: "You have successfully registered" });
    } else {
      return res.status(500).json({ message: "Something went wrong" });
    }
  } catch (error) {
    console.error("Error saving visitor:", error);
    return res.status(500).json({ message: "Unable to register, please try again later" });
  }
});

export default router;