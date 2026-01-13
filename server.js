import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ---------------- CONTACT FORM ---------------- */
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Message from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Email failed" });
  }
});

/* ---------------- GITHUB ACTIVITY ---------------- */
app.get("/api/github", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${process.env.GITHUB_USERNAME}/events/public`
    );
    const data = await response.json();

    res.json({
      latestEvent: data[0]?.type || "No activity found"
    });
  } catch (error) {
    res.status(500).json({ error: "GitHub fetch failed" });
  }
});
app.get("/", (req, res) => {
  res.send("Backend is running ✅ Use /api/github or /api/contact");
});


/* ---------------- SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
