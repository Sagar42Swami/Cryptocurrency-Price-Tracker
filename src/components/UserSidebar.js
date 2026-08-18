import React, { useState } from "react";
import {
  makeStyles,
  Drawer,
  Button,
  Tab,
  Tabs,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import CloseIcon from "@material-ui/icons/Close";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { CryptoState } from "../CryptoContext";
import { useHistory } from "react-router-dom";
import { numberWithCommas } from "./CoinsTable";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register elements required for the Doughnut chart
ChartJS.register(ArcElement, Tooltip, Legend);

const useStyles = makeStyles((theme) => ({
  drawerContainer: {
    width: 380,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Montserrat",
    backgroundColor: "#16171a",
    color: "white",
    padding: 20,
    boxSizing: "border-box",
  },
  tabs: {
    borderBottom: "1px solid #333",
    marginBottom: 15,
    "& .MuiTabs-indicator": {
      backgroundColor: "gold",
    },
  },
  tab: {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "darkgrey",
    "&.Mui-selected": {
      color: "gold",
    },
  },
  watchlistCoin: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#14161a",
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0px 4px 15px rgba(238, 188, 29, 0.1)",
    },
  },
  coinDetail: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  deleteBtn: {
    color: "rgb(244, 67, 54)",
    "&:hover": {
      backgroundColor: "rgba(244, 67, 54, 0.1)",
    },
  },
  portfolioSummary: {
    backgroundColor: "#14161a",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeft: "4px solid gold",
  },
  chartContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "15px 0",
    maxHeight: 160,
  },
  addHoldingBtn: {
    backgroundColor: "gold",
    color: "black",
    fontWeight: 700,
    fontFamily: "Montserrat",
    margin: "15px 0",
    "&:hover": {
      backgroundColor: "#cc9e10",
    },
  },
  dialogContainer: {
    "& .MuiPaper-root": {
      backgroundColor: "#16171a",
      color: "white",
      border: "1px solid gold",
      borderRadius: 10,
      padding: 10,
    },
  },
  dialogTitle: {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "gold",
  },
  formInput: {
    margin: "10px 0",
    width: "100%",
    "& .MuiInputBase-input": {
      color: "white",
    },
    "& .MuiInputLabel-root": {
      color: "darkgrey",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "grey",
      },
      "&:hover fieldset": {
        borderColor: "white",
      },
      "&.Mui-focused fieldset": {
        borderColor: "gold",
      },
    },
  },
  dialogBtn: {
    fontFamily: "Montserrat",
    fontWeight: "bold",
  },
}));

export default function UserSidebar({ open, onClose }) {
  const classes = useStyles();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState(0);

  // Portfolio Transaction modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  const {
    currency,
    symbol,
    coins,
    watchlist,
    removeFromWatchlist,
    portfolio,
    addToPortfolio,
    removeFromPortfolio,
  } = CryptoState();

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  // Open modal and prefill buy price if a coin is selected
  const handleOpenModal = () => {
    if (coins.length > 0) {
      setSelectedCoinId(coins[0].id);
      setBuyPrice(coins[0].current_price.toFixed(2));
    }
    setOpenModal(true);
  };

  const handleCoinChange = (e) => {
    const coinId = e.target.value;
    setSelectedCoinId(coinId);
    const coin = coins.find((c) => c.id === coinId);
    if (coin) {
      setBuyPrice(coin.current_price.toFixed(2));
    }
  };

  const handleAddHolding = () => {
    if (!selectedCoinId || !quantity || !buyPrice) return;
    addToPortfolio(selectedCoinId, quantity, buyPrice);
    setOpenModal(false);
    setQuantity("");
  };

  // Resolve watchlisted coin objects from coins list
  const watchlistedCoins = coins.filter((coin) => watchlist.includes(coin.id));

  // Compute portfolio items by aggregating holdings of the same coin
  const aggregatedPortfolio = portfolio.reduce((acc, tx) => {
    const coin = coins.find((c) => c.id === tx.id);
    if (!coin) return acc;

    if (!acc[tx.id]) {
      acc[tx.id] = {
        id: tx.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        totalQty: 0,
        totalCost: 0,
        currentPrice: coin.current_price,
        transactions: [],
      };
    }

    acc[tx.id].totalQty += tx.qty;
    acc[tx.id].totalCost += tx.qty * tx.buyPrice;
    acc[tx.id].transactions.push(tx);

    return acc;
  }, {});

  const portfolioItems = Object.values(aggregatedPortfolio);

  // Compute Summary Statistics
  const totalCost = portfolio.reduce((acc, tx) => acc + tx.qty * tx.buyPrice, 0);
  const currentValue = portfolioItems.reduce(
    (acc, item) => acc + item.totalQty * item.currentPrice,
    0
  );
  const netProfitLoss = currentValue - totalCost;
  const pnlPercentage = totalCost > 0 ? (netProfitLoss / totalCost) * 100 : 0;

  // Chart Data preparation
  const chartData = {
    labels: portfolioItems.map((item) => item.name),
    datasets: [
      {
        data: portfolioItems.map((item) => item.totalQty * item.currentPrice),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#4CAF50",
          "#E91E63",
          "#00BCD4",
        ],
        borderWidth: 1,
        borderColor: "#16171a",
      },
    ],
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.drawerContainer}>
        {/* Drawer Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Typography variant="h6" style={{ fontWeight: 800, color: "gold" }}>
            My Workspace
          </Typography>
          <IconButton onClick={onClose} style={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange} className={classes.tabs} variant="fullWidth">
          <Tab label="Watchlist" className={classes.tab} />
          <Tab label="Portfolio" className={classes.tab} />
        </Tabs>

        {/* Watchlist Tab Panel */}
        {activeTab === 0 && (
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 5 }}>
            {watchlistedCoins.length === 0 ? (
              <Typography style={{ color: "grey", textAlign: "center", marginTop: 50 }}>
                Your watchlist is empty. Click stars on the coin table to add favorites.
              </Typography>
            ) : (
              watchlistedCoins.map((coin) => {
                const profit = coin.price_change_percentage_24h >= 0;
                return (
                  <div
                    key={coin.id}
                    className={classes.watchlistCoin}
                    onClick={() => {
                      history.push(`/coins/${coin.id}`);
                      onClose();
                    }}
                  >
                    <div className={classes.coinDetail}>
                      <img src={coin.image} alt={coin.name} height="35" />
                      <div>
                        <Typography style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                          {coin.symbol}
                        </Typography>
                        <Typography variant="caption" style={{ color: "grey" }}>
                          {coin.name}
                        </Typography>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <Typography style={{ fontWeight: 600 }}>
                          {symbol} {numberWithCommas(coin.current_price.toFixed(2))}
                        </Typography>
                        <Typography
                          variant="caption"
                          style={{ color: profit ? "rgb(14, 203, 129)" : "red", fontWeight: 600 }}
                        >
                          {profit ? "+" : ""}
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </Typography>
                      </div>
                      <IconButton
                        className={classes.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(coin.id);
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Portfolio Tab Panel */}
        {activeTab === 1 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Portfolio Summary Card */}
            <div className={classes.portfolioSummary}>
              <Typography variant="body2" style={{ color: "grey", fontWeight: 600 }}>
                PORTFOLIO VALUE
              </Typography>
              <Typography variant="h5" style={{ fontWeight: 800, margin: "5px 0" }}>
                {symbol} {numberWithCommas(currentValue.toFixed(2))}
              </Typography>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <Typography variant="caption" style={{ color: "grey" }}>
                  Net Profit/Loss:
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: netProfitLoss >= 0 ? "rgb(14, 203, 129)" : "red", fontWeight: 700 }}
                >
                  {netProfitLoss >= 0 ? "+" : ""}
                  {symbol} {numberWithCommas(Math.abs(netProfitLoss).toFixed(2))} ({pnlPercentage.toFixed(2)}%)
                </Typography>
              </div>
            </div>

            {/* Allocation Doughnut Chart */}
            {portfolioItems.length > 0 && (
              <div className={classes.chartContainer}>
                <Doughnut
                  data={chartData}
                  options={{
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          color: "white",
                          font: {
                            family: "Montserrat",
                            size: 10,
                          },
                        },
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            )}

            {/* Quick Add Asset Button */}
            <Button
              variant="contained"
              className={classes.addHoldingBtn}
              startIcon={<AccountBalanceWalletIcon />}
              onClick={handleOpenModal}
              fullWidth
            >
              Add Transaction
            </Button>

            {/* Aggregated Portfolio List */}
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 5 }}>
              {portfolioItems.length === 0 ? (
                <Typography style={{ color: "grey", textAlign: "center", marginTop: 30 }}>
                  No holdings added. Record purchase logs to monitor returns.
                </Typography>
              ) : (
                portfolioItems.map((item) => {
                  const avgBuyPrice = item.totalCost / item.totalQty;
                  const itemValue = item.totalQty * item.currentPrice;
                  const itemProfit = itemValue - item.totalCost;
                  const itemProfitPercent = (itemProfit / item.totalCost) * 100;

                  return (
                    <div key={item.id} className={classes.watchlistCoin} style={{ cursor: "default" }}>
                      <div className={classes.coinDetail}>
                        <img src={item.image} alt={item.name} height="30" />
                        <div>
                          <Typography style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                            {item.symbol}
                          </Typography>
                          <Typography variant="caption" style={{ color: "lightgrey" }}>
                            {item.totalQty.toFixed(4)} holdings (Avg Buy: {symbol}{numberWithCommas(avgBuyPrice.toFixed(2))})
                          </Typography>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ textAlign: "right" }}>
                          <Typography style={{ fontWeight: 600 }}>
                            {symbol} {numberWithCommas(itemValue.toFixed(2))}
                          </Typography>
                          <Typography
                            variant="caption"
                            style={{ color: itemProfit >= 0 ? "rgb(14, 203, 129)" : "red", fontWeight: 700 }}
                          >
                            {itemProfit >= 0 ? "+" : ""}
                            {itemProfitPercent.toFixed(1)}%
                          </Typography>
                        </div>
                        {/* Remove all transactions for this coin */}
                        <IconButton
                          className={classes.deleteBtn}
                          onClick={() => {
                            // Delete each transaction one-by-one by timestamp
                            item.transactions.forEach((tx) => removeFromPortfolio(tx.timestamp));
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Entry Dialog Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        className={classes.dialogContainer}
      >
        <DialogTitle className={classes.dialogTitle}>Add Asset Purchase</DialogTitle>
        <DialogContent>
          <FormControl variant="outlined" style={{ width: "100%", margin: "10px 0" }}>
            <InputLabel id="coin-select-label" style={{ color: "darkgrey" }}>
              Select Coin
            </InputLabel>
            <Select
              labelId="coin-select-label"
              id="coin-select"
              value={selectedCoinId}
              onChange={handleCoinChange}
              label="Select Coin"
              style={{ color: "white", borderColor: "grey" }}
            >
              {coins.map((coin) => (
                <MenuItem key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol.toUpperCase()})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={`Buy Price (${currency})`}
            type="number"
            variant="outlined"
            className={classes.formInput}
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
          />
          <TextField
            label="Quantity Purchased"
            type="number"
            variant="outlined"
            className={classes.formInput}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenModal(false)}
            style={{ color: "grey" }}
            className={classes.dialogBtn}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddHolding}
            style={{ color: "gold" }}
            className={classes.dialogBtn}
          >
            Add Holding
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
