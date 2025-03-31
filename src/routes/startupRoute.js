import { Router } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";  // Load environment variables
import Startup from "../models/startup.model.js";

dotenv.config();
const router = Router();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Use 587 instead of 465
  secure: false, // `true` for port 465, `false` for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


router.post("/", async (req, res) => {
  const { name, college, city, email, contact, gender, team } = req.body;
  console.log(req.body);
  // Validate input fields
  if (!name || !college || !city || !email || !contact || !gender || !team) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create a new Startup instance
    const startup = new Startup({
      name,
      college,
      city,
      email,
      contact,
      gender,
      team,
    });

    // Save to database
    const newStartup = await startup.save();
     console.log("check",process.env.EMAIL_USER,process.env.EMAIL_PASS)
    if (newStartup) {
      try {
        // Email options
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Successful Payment and Accommodation Confirmation",
          html: `
            <p>Dear ${name},</p>
            <p>We are delighted to confirm that your payment for registration has been successfully processed. Here are your details:</p>
            <ul>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>College:</strong> ${college}</li>
              <li><strong>City:</strong> ${city}</li>
              <li><strong>Contact:</strong> ${contact}</li>
              <li><strong>Gender:</strong> ${gender}</li>
              <li><strong>Team:</strong> ${team}</li>
              <li><strong>Venue:</strong> Delhi Technological University, Rohini, New Delhi</li>
            </ul>
            <p>We look forward to hosting you at DTU. If you have any questions, feel free to contact us.</p>
            <p>Best Regards,<br>E-Cell DTU</p>
          `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", email);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return res.status(500).json({ message: "Registration successful, but confirmation email could not be sent." });
      }

      return res.status(200).json({ message: "You have successfully registered, and a confirmation email has been sent." });
    } else {
    
      return res.status(500).json({ message: "Something went wrong while saving registration." });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Unable to register, please try again later." });
  }
});

export default router;
