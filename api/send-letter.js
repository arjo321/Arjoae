#!/usr/bin/env node
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Discord webhook URL
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK || 
  "https://discord.com/api/webhooks/1418507158026194955/EUdPK7qV6XHspyJvrPqxOgcEoTHrZJP2_DZ3okqcilrxlIZegGvmJv9KM4uLBNeU8-KZ";

// Middleware
app.use(express.json());

// CORS support
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Serve static files (HTML, CSS, images, JS)
app.use(express.static(path.join(__dirname, "public")));

// Fallback for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle letter submission
app.post("/api/send-letter", async (req, res) => {
  try {
    const { senderName = "Anonymous", message = "", timestamp = "" } = req.body;

    if (!senderName.trim() || !message.trim()) {
      return res.status(400).json({ success: false, error: "Name and message are required" });
    }

    if (senderName.length > 60 || message.length > 1000) {
      return res.status(400).json({ success: false, error: "Input too long" });
    }

    const discordPayload = {
      embeds: [
        {
          title: "📮 New Letter Received!",
          color: 0xff416c,
          fields: [
            { name: "👤 From", value: senderName.trim().slice(0, 60), inline: true },
            { name: "📅 Date", value: timestamp ? timestamp.split("T")[0] : "Unknown", inline: true },
            { name: "💌 Message", value: message.trim().slice(0, 1000), inline: false },
          ],
          footer: { text: "Sent from ARJO's Link-in-Bio Website" },
          timestamp,
        },
      ],
    };

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (response.ok) {
      res.json({ success: true, message: "Letter sent successfully!" });
    } else {
      throw new Error(`Discord webhook failed with status ${response.status}`);
    }
  } catch (err) {
    console.error("Error sending letter:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Preflight for CORS
app.options("/api/send-letter", (req, res) => {
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
