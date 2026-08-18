import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { CoinList } from "./config/api";
import { getFallbackCoinList } from "./config/fallbackData";

const Crypto = createContext();

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const CryptoContext = ({ children }) => {
  const [currency, setCurrency] = useState("INR");
  const [symbol, setSymbol] = useState("₹");
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState(
    JSON.parse(localStorage.getItem("watchlist")) || []
  );
  const [portfolio, setPortfolio] = useState(
    JSON.parse(localStorage.getItem("portfolio")) || []
  );
  const [alerts, setAlerts] = useState(
    JSON.parse(localStorage.getItem("alerts")) || []
  );

  const fetchCoins = async () => {
    const cacheKey = `coins_cache_${currency}`;
    const cached = localStorage.getItem(cacheKey);
    let hasLoadedFromCache = false;

    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        setCoins(data);
        hasLoadedFromCache = true;
        
        // If cache is fresh (less than 1 minute), skip showing spinner and fetch silently in background
        if (Date.now() - timestamp < 60000) {
          axios.get(CoinList(currency)).then(({ data: freshData }) => {
            setCoins(freshData);
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: freshData }));
          }).catch(() => {});
          return;
        }
      } catch (e) {
        console.warn("Failed to parse cache", e);
      }
    }

    // Set spinner only if cache is stale or empty
    if (!hasLoadedFromCache) {
      setLoading(true);
    }

    try {
      const { data: freshData } = await axios.get(CoinList(currency));
      setCoins(freshData);
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: freshData }));
    } catch (error) {
      console.warn("Failed to fetch coins list from API, using fallback data", error);
      const fallback = getFallbackCoinList(currency);
      setCoins(fallback);
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: fallback }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  useEffect(() => {
    if (currency === "INR") setSymbol("₹");
    else if (currency === "USD") setSymbol("$");
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem("alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Request browser Notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Monitor live prices to trigger price alerts
  useEffect(() => {
    if (coins.length === 0 || alerts.length === 0) return;

    let updated = false;
    const newAlerts = alerts.map((alert) => {
      if (alert.triggered) return alert;

      const coin = coins.find((c) => c.id === alert.id);
      if (!coin) return alert;

      const currentPrice = coin.current_price;
      const conditionMet =
        alert.condition === "above"
          ? currentPrice >= alert.price
          : currentPrice <= alert.price;

      if (conditionMet) {
        triggerNotification(coin.name, currentPrice, alert.condition, alert.price);
        updated = true;
        return { ...alert, triggered: true };
      }
      return alert;
    });

    if (updated) {
      setAlerts(newAlerts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins]);

  const triggerNotification = (coinName, currentPrice, condition, targetPrice) => {
    const formattedPrice = `${symbol}${numberWithCommas(currentPrice.toFixed(2))}`;
    const formattedTarget = `${symbol}${numberWithCommas(targetPrice.toFixed(2))}`;
    const title = `Price Alert Triggered! 🚨`;
    const options = {
      body: `${coinName} is now ${condition} your target of ${formattedTarget}. Current price: ${formattedPrice}`,
    };

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, options);
      } catch (e) {
        console.warn("Failed to trigger push notification", e);
      }
    }
    
    // Fallback: Custom alert toast
    alert(`🚨 ALERT: ${coinName} is now ${condition} your target of ${formattedTarget}! (Current: ${formattedPrice})`);
  };

  const addToWatchlist = (coinId) => {
    if (!watchlist.includes(coinId)) {
      setWatchlist([...watchlist, coinId]);
    }
  };

  const removeFromWatchlist = (coinId) => {
    setWatchlist(watchlist.filter((id) => id !== coinId));
  };

  const addToPortfolio = (coinId, quantity, buyPrice) => {
    const newTransaction = {
      id: coinId,
      qty: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      timestamp: Date.now(),
    };
    setPortfolio([...portfolio, newTransaction]);
  };

  const removeFromPortfolio = (timestamp) => {
    setPortfolio(portfolio.filter((tx) => tx.timestamp !== timestamp));
  };

  const addAlert = (coinId, targetPrice, condition) => {
    const newAlert = {
      id: coinId,
      price: parseFloat(targetPrice),
      condition,
      triggered: false,
      timestamp: Date.now(),
    };
    setAlerts([...alerts, newAlert]);
  };

  const removeAlert = (timestamp) => {
    setAlerts(alerts.filter((alert) => alert.timestamp !== timestamp));
  };

  const clearTriggeredAlerts = () => {
    setAlerts(alerts.filter((alert) => !alert.triggered));
  };

  return (
    <Crypto.Provider
      value={{
        currency,
        setCurrency,
        symbol,
        coins,
        loading,
        fetchCoins,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        portfolio,
        addToPortfolio,
        removeFromPortfolio,
        alerts,
        addAlert,
        removeAlert,
        clearTriggeredAlerts,
      }}
    >
      {children}
    </Crypto.Provider>
  );
};

export default CryptoContext;

export const CryptoState = () => {
  return useContext(Crypto);
};
