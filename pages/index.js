import { useState, useEffect, useRef } from "react";

function RejectionPointAlerts({ livePrice }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const audioRef = useRef(null);
  const timeframes = ["1Min","3Min","5Min","15Min","30Min","45Min","1HR","2HR","3HR","4HR","Daily","Weekly","Monthly"];
  const [alerts, setAlerts] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("rpa_alerts") : null;
    return saved ? JSON.parse(saved) : Array(25).fill().map(() => ({
      timeframe: "1Min",
      price: "",
      enabled: false,
      message: ""
    }));
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rpa_alerts", JSON.stringify(alerts));
    }
  }, [alerts]);

  useEffect(() => {
    alerts.forEach((a, idx) => {
      if (a.enabled && a.price !== "" && livePrice !== null) {
        if (parseFloat(livePrice) >= parseFloat(a.price)) {
          if (!a.fired) {
            audioRef.current && audioRef.current.play();
            alert(a.message || `Rejection Point Alert ${idx+1} Triggered!`);
            setAlerts(prev => {
              const updated = [...prev];
              updated[idx].fired = true;
              return updated;
            });
          }
        } else {
          if (a.fired) {
            setAlerts(prev => {
              const updated = [...prev];
              updated[idx].fired = false;
              return updated;
            });
          }
        }
      }
    });
  }, [livePrice]);

  const updateAlert = (idx, field, value) => {
    setAlerts(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  return (
    <div className="border rounded-2xl shadow-lg bg-white p-4 mb-6">
      <div className="flex justify-between items-center mb-2"><h2 className="font-bold text-lg mb-2">Rejection Point alerts</h2><button onClick={() => setIsCollapsed(!isCollapsed)} className="px-2 py-1 bg-blue-500 text-white rounded">{isCollapsed ? "Expand" : "Collapse"}</button></div>
      {!isCollapsed && alerts.map((a, idx) => (
        <div key={idx} className="flex flex-wrap gap-2 mb-2 items-center">
          <span className="font-semibold">#{(idx + 1).toString().padStart(2, "0")}</span>
          <select
            className="border rounded p-1"
            value={a.timeframe}
            onChange={(e) => updateAlert(idx, "timeframe", e.target.value)}
          >
            {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
          </select>
          <input
            className="border rounded p-1 w-20"
            type="number"
            value={a.price}
            onChange={(e) => updateAlert(idx, "price", e.target.value)}
            placeholder="Price"
          />
          <input
            className="border rounded p-1 w-40"
            type="text"
            value={a.message}
            onChange={(e) => updateAlert(idx, "message", e.target.value)}
            placeholder="Message"
          />
          <input
            type="checkbox"
            checked={a.enabled}
            onChange={() => updateAlert(idx, "enabled", !a.enabled)}
          />
          <span>Enable</span>
        </div>
      ))}
      <audio ref={audioRef}>
        <source src="/beep.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

function GenericPanel({ panelNumber }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="border rounded-2xl shadow-lg bg-white p-4 mb-6">
      <div className="flex justify-between items-center mb-2"><h2 className="font-bold text-lg">Panel {panelNumber}</h2><button onClick={() => setIsCollapsed(!isCollapsed)} className="px-2 py-1 bg-blue-500 text-white rounded">{isCollapsed ? "Expand" : "Collapse"}</button></div>
      <div style={{ display: isCollapsed ? "none" : "block" }}>
    {panelNumber === 3 ? <BreakTargetImageUI /> : <p className="text-sm text-gray-600">Panel content here.</p>}
    </div>
    </div>
  );
}

export default function Home() {
  const [livePrice, setLivePrice] = useState(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch("/api/qqq-price-hook");
        const data = await res.json();
        if (data && data.price) {
          setLivePrice(data.price);
        }
      } catch (err) {
        console.error("Price poll error:", err);
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto">
        <div className="border rounded-2xl shadow-lg bg-white p-4 mb-6">
          <h2 className="font-bold text-lg mb-2">Panel 1</h2>
          <p className="font-semibold mb-2">Live QQQ Price (Upstash): {livePrice !== null ? `$${livePrice}` : "Waiting for webhook..."}</p>
          <div className="w-full">
            <iframe
              src="https://s.tradingview.com/widgetembed/?symbol=NASDAQ%3AQQQ&interval=1&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=Light&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&autosize=1"
              width="100%"
              height="400"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <RejectionPointAlerts livePrice={livePrice} />
        <ChanelBoundsAlerts livePrice={livePrice} />
        {[...Array(8)].map((_, idx) => (
          <GenericPanel key={idx + 3} panelNumber={idx + 3} />
        ))}
      </div>
    </div>
  );
}
function ChanelBoundsAlerts({ livePrice }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const audioRef = useRef(null);
  const timeframes = ["1Min","3Min","5Min","15Min","30Min","45Min","1HR","2HR","3HR","4HR","Daily","Weekly","Monthly"];
  const [alerts, setAlerts] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("cba_alerts") : null;
    return saved ? JSON.parse(saved) : Array(25).fill().map(() => ({
      timeframe: "1Min",
      price: "",
      enabled: false,
      message: ""
    }));
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cba_alerts", JSON.stringify(alerts));
    }
  }, [alerts]);

  useEffect(() => {
    alerts.forEach((a, idx) => {
      if (a.enabled && a.price !== "" && livePrice !== null) {
        if (parseFloat(livePrice) >= parseFloat(a.price)) {
          if (!a.fired) {
            audioRef.current && audioRef.current.play();
            alert(a.message || `Chanel Bounds Alert ${idx+1} Triggered!`);
            setAlerts(prev => {
              const updated = [...prev];
              updated[idx].fired = true;
              return updated;
            });
          }
        } else {
          if (a.fired) {
            setAlerts(prev => {
              const updated = [...prev];
              updated[idx].fired = false;
              return updated;
            });
          }
        }
      }
    });
  }, [livePrice]);

  const updateAlert = (idx, field, value) => {
    setAlerts(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  return (
    <div className="border rounded-2xl shadow-lg bg-white p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg mb-2">Chanel bounds alerts</h2>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="px-2 py-1 bg-blue-500 text-white rounded">{isCollapsed ? "Expand" : "Collapse"}</button>
      </div>
      {!isCollapsed && alerts.map((a, idx) => (
        <div key={idx} className="flex flex-wrap gap-2 mb-2 items-center">
          <span className="font-semibold">#{(idx + 1).toString().padStart(2, "0")}</span>
          <select
            className="border rounded p-1"
            value={a.timeframe}
            onChange={(e) => updateAlert(idx, "timeframe", e.target.value)}
          >
            {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
          </select>
          <input
            className="border rounded p-1 w-20"
            type="number"
            value={a.price}
            onChange={(e) => updateAlert(idx, "price", e.target.value)}
            placeholder="Price"
          />
          <input
            className="border rounded p-1 w-40"
            type="text"
            value={a.message}
            onChange={(e) => updateAlert(idx, "message", e.target.value)}
            placeholder="Message"
          />
          <input
            type="checkbox"
            checked={a.enabled}
            onChange={() => updateAlert(idx, "enabled", !a.enabled)}
          />
          <span>Enable</span>
        </div>
      ))}
      <audio ref={audioRef}>
        <source src="/beep.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}




function BreakTargetImageUI() {
  const timeframes = ["1Min","3Min","5Min","15Min","30Min","45Min","1HR","2HR","3HR","4HR","Daily","Weekly","Monthly"];
  const [configs, setConfigs] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("panel3_configs") : null;
    return saved ? JSON.parse(saved) : Array(30).fill().map(() => ({
      timeframe: "1Min",
      coilHigh: "",
      coilLow: "",
      upwardTarget: null,
      downwardTarget: null,
      upAlertPrice: "",
      downAlertPrice: "",
      upAlertEnabled: false,
      downAlertEnabled: false,
      upAlertFired: false,
      downAlertFired: false,
      alertMessage: ""
    }));
  });

  const [livePrice, setLivePrice] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/qqq-price-hook");
        if (res.ok) {
          const data = await res.json();
          setLivePrice(data.price);
        }
      } catch (err) {
        console.error("Live price fetch failed:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("panel3_configs", JSON.stringify(configs));
    }
  }, [configs]);

  useEffect(() => {
    if (livePrice) {
      const price = parseFloat(livePrice);
      setConfigs(prev =>
        prev.map((cfg) => {
          const updated = { ...cfg };
          if (cfg.upAlertEnabled && cfg.upAlertPrice) {
            if (!cfg.upAlertFired && price >= parseFloat(cfg.upAlertPrice)) {
              audioRef.current?.play();
              alert(cfg.alertMessage || "Up Alert Triggered");
              updated.upAlertFired = true;
            } else if (cfg.upAlertFired && price < parseFloat(cfg.upAlertPrice)) {
              updated.upAlertFired = false;
            }
          }
          if (cfg.downAlertEnabled && cfg.downAlertPrice) {
            if (!cfg.downAlertFired && price <= parseFloat(cfg.downAlertPrice)) {
              audioRef.current?.play();
              alert(cfg.alertMessage || "Down Alert Triggered");
              updated.downAlertFired = true;
            } else if (cfg.downAlertFired && price > parseFloat(cfg.downAlertPrice)) {
              updated.downAlertFired = false;
            }
          }
          return updated;
        })
      );
    }
  }, [livePrice]);

  const updateConfig = (idx, field, value) => {
    setConfigs(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const calculateTargets = (idx) => {
    const high = parseFloat(configs[idx].coilHigh);
    const low = parseFloat(configs[idx].coilLow);
    if (!isNaN(high) && !isNaN(low)) {
      const range = high - low;
      updateConfig(idx, "upwardTarget", (high + range).toFixed(2));
      updateConfig(idx, "downwardTarget", (low - range).toFixed(2));
    }
  };

  return (
    <div>
      {configs.map((cfg, idx) => (
        <div key={idx} className="border rounded-xl p-4 mb-4 shadow">
          <h3 className="font-bold mb-2">📦 Config #{idx + 1}</h3>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <label>Timeframe:</label>
            <select value={cfg.timeframe} onChange={(e) => updateConfig(idx, "timeframe", e.target.value)}>
              {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
            </select>
            <input type="number" value={cfg.coilHigh} onChange={(e) => updateConfig(idx, "coilHigh", e.target.value)} placeholder="Coil High" />
            <input type="number" value={cfg.coilLow} onChange={(e) => updateConfig(idx, "coilLow", e.target.value)} placeholder="Coil Low" />
            <button onClick={() => calculateTargets(idx)} className="bg-blue-500 text-white px-2 py-1 rounded">Calculate Targets</button>
          </div>
          {cfg.upwardTarget && cfg.downwardTarget && (
            <div className="text-sm text-gray-700 mb-2">
              <p>📈 Upward Target: <strong>${cfg.upwardTarget}</strong></p>
              <p>📉 Downward Target: <strong>${cfg.downwardTarget}</strong></p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <label>Up Alert Price:</label>
            <input type="number" value={cfg.upAlertPrice} onChange={(e) => updateConfig(idx, "upAlertPrice", e.target.value)} />
            <input type="checkbox" checked={cfg.upAlertEnabled} onChange={() => updateConfig(idx, "upAlertEnabled", !cfg.upAlertEnabled)} />
            <span>{cfg.upAlertEnabled ? "Up Alert Set" : "Up Alert Off"}</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <label>Down Alert Price:</label>
            <input type="number" value={cfg.downAlertPrice} onChange={(e) => updateConfig(idx, "downAlertPrice", e.target.value)} />
            <input type="checkbox" checked={cfg.downAlertEnabled} onChange={() => updateConfig(idx, "downAlertEnabled", !cfg.downAlertEnabled)} />
            <span>{cfg.downAlertEnabled ? "Down Alert Set" : "Down Alert Off"}</span>
          </div>
          <div className="flex gap-2 items-center mb-2">
            <label>Alert Message:</label>
            <input type="text" value={cfg.alertMessage} onChange={(e) => updateConfig(idx, "alertMessage", e.target.value)} className="border p-1 rounded w-64" />
          </div>
        </div>
      ))}
      <audio ref={audioRef}>
        <source src="/alert.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
