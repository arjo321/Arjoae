import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { senderName, message, timestamp } = req.body;

      if (!senderName || !message) {
        return res.status(400).json({ success: false, error: "Name and message are required" });
      }

      const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
      if (!WEBHOOK_URL) {
        return res.status(500).json({ success: false, error: "Webhook URL not set" });
      }

      const payload = {
        embeds: [
          {
            title: "📮 New Letter Received!",
            color: 0xff416c,
            fields: [
              { name: "👤 From", value: senderName, inline: true },
              { name: "📅 Date", value: timestamp?.split('T')[0] ?? "Unknown", inline: true },
              { name: "💌 Message", value: message, inline: false }
            ],
            footer: { text: "Sent from ARJO's Link-in-Bio Website" },
            timestamp
          }
        ]
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Webhook failed with status ${response.status}`);

      res.status(200).json({ success: true, message: "Letter sent successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}
