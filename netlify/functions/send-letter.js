import fetch from "node-fetch";

export async function handler(event, context) {
  if (event.httpMethod === "POST") {
    try {
      const { senderName, message, timestamp } = JSON.parse(event.body);

      if (!senderName || !message) {
        return { statusCode: 400, body: JSON.stringify({ success: false, error: "Name and message required" }) };
      }

      const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
      if (!WEBHOOK_URL) {
        return { statusCode: 500, body: JSON.stringify({ success: false, error: "Webhook not set" }) };
      }

      const payload = {
        embeds: [
          {
            title: "📮 New Letter Received!",
            color: 0xff416c,
            fields: [
              { name: "👤 From", value: senderName, inline: true },
              { name: "📅 Date", value: timestamp?.split("T")[0] ?? "Unknown", inline: true },
              { name: "💌 Message", value: message, inline: false }
            ],
            footer: { text: "Sent from ARJO's Link-in-Bio Website" },
            timestamp
          }
        ]
      };

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Webhook failed with status ${response.status}`);

      return { statusCode: 200, body: JSON.stringify({ success: true, message: "Letter sent!" }) };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
    }
  } else {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: "Method not allowed" }) };
  }
}
