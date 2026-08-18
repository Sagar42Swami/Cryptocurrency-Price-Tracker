// Fallback data helper for when CoinGecko API fails or is rate-limited (HTTP 429)

const USD_TO_INR = 83.5;

// High-quality static list of standard cryptocurrencies (in USD defaults)
const BASE_COINS = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    usd_price: 64250.00,
    usd_market_cap: 1260000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.45,
    description: "Bitcoin is the first decentralized digital currency. It was created in 2009 by an anonymous person or group under the pseudonym Satoshi Nakamoto. Transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a blockchain. Bitcoin is known for its finite supply of 21 million coins, making it a digital store of value similar to gold."
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    usd_price: 3450.00,
    usd_market_cap: 415000000000,
    market_cap_rank: 2,
    price_change_percentage_24h: 3.12,
    description: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform. Among cryptocurrencies, Ether is second only to Bitcoin in market capitalization. Ethereum was proposed in late 2013 by Vitalik Buterin, a cryptocurrency researcher and programmer, and development was crowdfunded in 2014, with the network going live in 2015."
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    usd_price: 580.00,
    usd_market_cap: 85000000000,
    market_cap_rank: 3,
    price_change_percentage_24h: -0.85,
    description: "BNB powers the BNB Chain ecosystem and is the native token of the Binance cryptocurrency exchange. Launched in 2017 through an initial coin offering (ICO), BNB can be used to pay for transaction fees on the exchange, participate in token sales, and execute smart contracts on the BNB Smart Chain."
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    usd_price: 175.50,
    usd_market_cap: 81000000000,
    market_cap_rank: 4,
    price_change_percentage_24h: 8.94,
    description: "Solana is a high-performance blockchain supporting builders globally to create crypto apps that scale today. It utilizes a unique consensus mechanism called Proof of History (PoH) combined with Proof of Stake (PoS) to process tens of thousands of transactions per second with extremely low fees."
  },
  {
    id: "ripple",
    symbol: "xrp",
    name: "Ripple",
    image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    usd_price: 0.615,
    usd_market_cap: 34500000000,
    market_cap_rank: 5,
    price_change_percentage_24h: 1.22,
    description: "Ripple is a real-time gross settlement system, currency exchange and remittance network created by Ripple Labs Inc. Released in 2012, Ripple purports to enable secure, instant and nearly free global financial transactions of any size with no chargebacks."
  },
  {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    usd_price: 0.485,
    usd_market_cap: 17200000000,
    market_cap_rank: 6,
    price_change_percentage_24h: -1.45,
    description: "Cardano is a decentralized public blockchain and cryptocurrency project that is fully open-source. Cardano is developing a smart contract platform which seeks to deliver more advanced features than any protocol previously developed. It is the first blockchain platform to evolve out of a scientific philosophy and a research-first driven approach."
  },
  {
    id: "dogecoin",
    symbol: "doge",
    name: "Dogecoin",
    image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
    usd_price: 0.135,
    usd_market_cap: 19500000000,
    market_cap_rank: 7,
    price_change_percentage_24h: 12.30,
    description: "Dogecoin is an open-source peer-to-peer cryptocurrency. It is valued by Shiba Inus worldwide and was created by Billy Markus and Jackson Palmer as a joke in December 2013, satirizing the growth of alternative cryptocurrencies. It quickly developed its own online community and became a major digital currency used for tipping and charity."
  },
  {
    id: "polkadot",
    symbol: "dot",
    name: "Polkadot",
    image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
    usd_price: 6.85,
    usd_market_cap: 9800000000,
    market_cap_rank: 8,
    price_change_percentage_24h: -0.15,
    description: "Polkadot is an open source sharded multichain protocol that connects and secures a network of specialized blockchains, facilitating cross-chain transfer of any data or asset types, not just tokens, thereby allowing blockchains to be interoperable with each other."
  },
  {
    id: "avalanche-2",
    symbol: "avax",
    name: "Avalanche",
    image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
    usd_price: 28.90,
    usd_market_cap: 11200000000,
    market_cap_rank: 9,
    price_change_percentage_24h: 4.56,
    description: "Avalanche is a smart contracts platform built to scale infinitely and finalize transactions in under a second. Its novel consensus protocol, subnets infrastructure, and HyperSDK toolkit enable Web3 developers to easily launch custom, app-specific blockchains."
  },
  {
    id: "chainlink",
    symbol: "link",
    name: "Chainlink",
    image: "https://assets.coingecko.com/coins/images/877/large/chainlink-link.png",
    usd_price: 14.20,
    usd_market_cap: 8400000000,
    market_cap_rank: 10,
    price_change_percentage_24h: 2.10,
    description: "Chainlink is a decentralized oracle network that provides real-world data to smart contracts on the blockchain. Smart contracts are self-executing agreements, but they cannot access data outside their blockchain network. Chainlink solves this by connecting them to external data feeds, APIs, and payment systems."
  }
];

// Helper to convert BASE_COINS list matching the CoinGecko API format
export const getFallbackCoinList = (currency) => {
  const isINR = currency === "INR";
  const rate = isINR ? USD_TO_INR : 1;

  return BASE_COINS.map(coin => ({
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    image: coin.image,
    current_price: coin.usd_price * rate,
    market_cap: coin.usd_market_cap * rate,
    market_cap_rank: coin.market_cap_rank,
    price_change_percentage_24h: coin.price_change_percentage_24h,
    total_volume: coin.usd_market_cap * 0.05 * rate, // Simulated volume
    high_24h: coin.usd_price * 1.05 * rate,
    low_24h: coin.usd_price * 0.95 * rate,
  }));
};

// Returns a subset of top coins with high positive/negative changes for the carousel
export const getFallbackTrendingCoins = (currency) => {
  const isINR = currency === "INR";
  const rate = isINR ? USD_TO_INR : 1;

  // Let's return Bitcoin, Ethereum, Solana, and Dogecoin as trending
  const trendingIds = ["bitcoin", "ethereum", "solana", "dogecoin"];
  return BASE_COINS
    .filter(coin => trendingIds.includes(coin.id))
    .map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.usd_price * rate,
      price_change_percentage_24h: coin.price_change_percentage_24h,
    }));
};

// Returns single coin detailed details matching CoinGecko API format
export const getFallbackSingleCoin = (id, currency) => {
  const coin = BASE_COINS.find(c => c.id === id) || BASE_COINS[0];
  
  // SingleCoin needs details structured exactly like Coingecko's response
  return {
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    image: {
      large: coin.image,
      small: coin.image,
      thumb: coin.image,
    },
    description: {
      en: coin.description,
    },
    market_cap_rank: coin.market_cap_rank,
    market_data: {
      current_price: {
        usd: coin.usd_price,
        inr: coin.usd_price * USD_TO_INR,
      },
      market_cap: {
        usd: coin.usd_market_cap,
        inr: coin.usd_market_cap * USD_TO_INR,
      },
    },
  };
};

// Generates a mock historical chart data using a random walk starting from the coin's price
export const getFallbackHistoricalChart = (id, days = 365, currency) => {
  const coin = BASE_COINS.find(c => c.id === id) || BASE_COINS[0];
  const isINR = currency === "INR";
  const rate = isINR ? USD_TO_INR : 1;
  const currentPrice = coin.usd_price * rate;

  const prices = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Determine how many data points to generate
  let pointsCount = days;
  let intervalMs = dayMs;

  if (days === 1) {
    // 24 hours: 1 point per hour
    pointsCount = 24;
    intervalMs = 60 * 60 * 1000;
  } else if (days === 30) {
    // 30 days: 1 point per day
    pointsCount = 30;
    intervalMs = dayMs;
  } else if (days === 90) {
    // 90 days: 1 point per day
    pointsCount = 90;
    intervalMs = dayMs;
  } else {
    // 365 days or other: 1 point per 2 days
    pointsCount = Math.min(days, 180);
    intervalMs = dayMs * (days / pointsCount);
  }

  let runningPrice = currentPrice * (1 - (coin.price_change_percentage_24h / 100)); // Start in the past

  for (let i = pointsCount; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    // Introduce random fluctuation (-2.5% to +2.7%)
    const changeFactor = 1 + (Math.random() * 0.052 - 0.025);
    runningPrice = runningPrice * changeFactor;
    
    // Safety check to avoid negative prices
    if (runningPrice <= 0) runningPrice = currentPrice * 0.1;

    prices.push([timestamp, runningPrice]);
  }

  // Force last point to be close to current price
  prices.push([now, currentPrice]);

  return prices;
};
