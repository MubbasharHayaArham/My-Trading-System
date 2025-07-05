
import { useEffect, useState } from 'react';

export default function Home() {
  const [qqq, setQqq] = useState(null);
  const [btc, setBtc] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        const data = await res.json();
        setQqq(data.qqq);
        setBtc(data.btc);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontSize: '24px', padding: '2rem' }}>
      <p>📈 QQQ Live Price: {qqq ?? "Loading..."}</p>
      <p>💰 BTC Live Price: {btc ?? "Loading..."}</p>
    </div>
  );
}
