
import { redis } from '../../lib/redis';

export default async function handler(req, res) {
  try {
    const qqq = await redis.get("qqqPrice");
    const btc = await redis.get("btcPrice");

    return res.status(200).json({ qqq, btc });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
