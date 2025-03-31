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
            <p>
Congratulations! Your payment for Techstars Startup Weekend 2025 by E-Cell DTU, powered by Google for Startups, has been successfully received. We’re thrilled to have you join us for this incredible 3-day experience on April 4, 5, and 6, 2025 at DTU.
from team ${team}.</p>
 <p> Here are a few important reminders to ensure a smooth experience:
</p>
          <ul>
            <li><strong>Carry your ID for verification at the entrance.
</strong></li>
            <li><strong>Maintain a respectful atmosphere on campus.
</strong></li>
            <li><strong>Bring an extension cord for power and a water bottle for refills.
</strong></li>
            <li><strong>Follow curfew guidelines to avoid any inconvenience.
</strong> </li>
            <li><strong>We’ll share reporting location details before the event.
</strong></li>
            <li><strong>Strictly avoid bringing liquor, e-cigarettes, vapes, tobacco, or any other prohibited substances.
</strong>
 </li>
            <p>We can’t wait to see the amazing ideas you’ll bring to life. Get ready for an exciting weekend of innovation, networking, and collaboration!

If you have any questions, feel free to reach out.

See you soon!
.</p>
            <p>Best Regards,<br>aayush jain<br>cohead<br>E-Cell DTU</p>
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
