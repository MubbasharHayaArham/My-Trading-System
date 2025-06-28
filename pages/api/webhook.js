
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const body = req.body;

  if (!body || !body.symbol || !body.bias || !body.price) {
    return res.status(400).json({ error: "Missing data in webhook" });
  }

  const alert = {
    timestamp: new Date().toISOString(),
    ...body,
  };

  await redis.set("latest_alert", JSON.stringify(alert));

  console.log("Stored TradingView Alert in Redis:", alert);

  return res.status(200).json({ success: true });
}
