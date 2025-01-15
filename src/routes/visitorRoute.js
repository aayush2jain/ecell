import { Router } from "express";
import nodemailer from 'nodemailer'; // Use import for nodemailer
import Visitor from "../models/visitor.model.js";
const router = Router();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail as the service (or your preferred email provider)
  auth: {
    user: 'aayushjain1290@gmail.com', // Your email address
    pass: 'okrbbelheaiuaxst', 
  },
});

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
      // Send order confirmation email
      const mailOptions = {
        from: 'aayushjain1290@gmail.com', // Sender email
        to: email,                     // Recipient email
        subject: 'Order Confirmation',
        text: 'Hello, your registration is confirmed!', // Email body content
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "You have successfully registered, and a confirmation email has been sent." });
    } else {
      return res.status(500).json({ message: "Something went wrong" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Unable to register, please try again later" });
  }
});

export default router;
