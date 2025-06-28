
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const alert = await redis.get("latest_alert");
  if (!alert) return res.status(404).json({ message: "No alerts found" });

  res.status(200).json(alert);
}
