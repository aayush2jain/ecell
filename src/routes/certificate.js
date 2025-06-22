const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
require("dotenv").config();

const users = [
  { name: "Aayush Jain", email: "aayushjain9512@gmail.com" },
];

async function generateCertificate(userName, outputPath) {
  const templatePath = path.resolve(__dirname, "templates", "certificate_template.html");
  let html = fs.readFileSync(templatePath, "utf8").replace("{{name}}", userName);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({ path: outputPath, format: "A4" });
  await browser.close();
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

(async () => {
  for (const user of users) {
    const fileName = `${user.name.replace(/\s+/g, "_")}_Certificate.pdf`;
    const filePath = path.join(__dirname, "certificates", fileName);
    await generateCertificate(user.name, filePath);
    await sendCertificate(user.email, user.name, filePath);
  }
})();
