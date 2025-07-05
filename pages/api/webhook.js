
import { redis } from '../../lib/redis';

export default async function handler(req, res) {
  try {
    console.log("Received webhook payload:", req.body);
    const { qqqPrice, btcPrice } = req.body;

    if (qqqPrice) await redis.set("qqqPrice", qqqPrice);
    if (btcPrice) await redis.set("btcPrice", btcPrice);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: error.message });
  }
}
