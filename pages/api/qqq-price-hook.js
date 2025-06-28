import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: 'https://rapid-pony-47947.upstash.io',
  token: 'AbtLAAIjcDE3NDM1NmEzNWEzMDM0OTk2ODcxZjRjMzg2NWJhMzcwOHAxMA',
});
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { price } = req.body;
      if (price) {
        await redis.set("qqq_price", price);
        res.status(200).json({ message: "Price saved", price });
      } else {
        res.status(400).json({ error: "No price in payload" });
      }
    } catch {
      res.status(500).json({ error: "Server error saving price" });
    }
  } else if (req.method === 'GET') {
    try {
      const price = await redis.get("qqq_price");
      res.status(200).json({ price });
    } catch {
      res.status(500).json({ error: "Server error fetching price" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}