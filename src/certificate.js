import dotenv from 'dotenv';
import connectDb from "./db/index.js";
import { User } from "./models/user.model.js";
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({
    path: './.env'
});

// Function to generate PDF certificate
async function generateCertificate(userName, outputPath) {
    const templatePath = path.resolve(__dirname, "templates", "index.html");
    let html = fs.readFileSync(templatePath, "utf8");
    html = html.replace("{{name}}", userName);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.waitForFunction(() =>
        Array.from(document.images).every(img => img.complete)
    );

    await page.pdf({ path: outputPath, format: "A4", printBackground: true });
    await browser.close();
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send email with PDF attachment
async function sendCertificate(email, name, pdfPath) {
    const mailOptions = {
        from: `"E-Cell DTU" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Internship Certificate from E-Cell DTU",
        html: `
          <p>Dear ${name},</p>
          <p>We are delighted to inform you that your internship with <strong>E-Cell DTU</strong> is now successfully completed.</p>
          <p>Attached is your certificate of internship. Thank you for your efforts and dedication.</p>
          <p>Warm regards,<br/>Team E-Cell DTU</p>
        `,
        attachments: [
            {
                filename: "Internship_Certificate.pdf",
                path: pdfPath,
                contentType: "application/pdf",
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Certificate sent to ${email}`);
    } catch (err) {
        console.error(`❌ Error sending to ${email}:`, err.message);
    }
}

// Main execution
const automail = async () => {
    try {
        // const users = await User.find({}).select("email username");
      const users = [
        {
            email:"aayushjain9512@gmail.com",
            username: "Aayush Jain"
        }
      ]

        const certificatesDir = path.join(__dirname, "certificates");
        if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir);
        }

        let startSending = false;

        for (const user of users) {
            // if (!startSending) {
            //     if (user.email === "lakshyapandey.usar@gmail.com") {
            //         startSending = true;
            //         console.log(`Starting to send certificates from ${user.email}`);
            //         continue; // skip this one (start after it)
            //     } else {
            //         continue;
            //     }
            // }

            console.log(`Processing user: ${user.email}`);
            const fileName = `${user.username.replace(/\s+/g, "_")}_Certificate.pdf`;
            const filePath = path.join(certificatesDir, fileName);

            await generateCertificate(user.username, filePath);
            await sendCertificate(user.email, user.username, filePath);
        }
    } catch (error) {
        console.error('❌ An error occurred:', error.message);
    }
}
export default automail;