import { LinearProgress, makeStyles, Typography, Button } from "@material-ui/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CoinInfo from "../components/CoinInfo";
import { SingleCoin } from "../config/api";
import { numberWithCommas } from "../components/CoinsTable";
import { CryptoState } from "../CryptoContext";
import { getFallbackSingleCoin } from "../config/fallbackData";

const CoinPage = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState();

  const { currency, symbol, coins, watchlist, addToWatchlist, removeFromWatchlist } = CryptoState();

  const fetchCoin = async () => {
    try {
      const { data } = await axios.get(SingleCoin(id));
      setCoin(data);
    } catch (error) {
      console.warn("Failed to fetch coin details, using fallback data", error);
      setCoin(getFallbackSingleCoin(id, currency));
    }
  };

  useEffect(() => {
    fetchCoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const useStyles = makeStyles((theme) => ({
    container: {
      display: "flex",
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
        alignItems: "center",
      },
    },
    sidebar: {
      width: "30%",
      [theme.breakpoints.down("md")]: {
        width: "100%",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: 25,
      borderRight: "2px solid grey",
    },
    heading: {
      fontWeight: "bold",
      marginBottom: 20,
      fontFamily: "Montserrat",
    },
    description: {
      width: "100%",
      fontFamily: "Montserrat",
      padding: 25,
      paddingBottom: 15,
      paddingTop: 0,
      textAlign: "justify",
    },
    marketData: {
      alignSelf: "start",
      padding: 25,
      paddingTop: 10,
      width: "100%",
      [theme.breakpoints.down("md")]: {
        display: "flex",
        justifyContent: "space-around",
      },
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "center",
      },
      [theme.breakpoints.down("xs")]: {
        alignItems: "start",
      },
    },
  }));

  const classes = useStyles();

  const cachedCoin = coins?.find((c) => c.id === id);
  const inWatchlist = watchlist?.includes(id);

  // Blocker loader only shown if both remote details and global cached details are missing
  if (!coin && !cachedCoin) return <LinearProgress style={{ backgroundColor: "gold" }} />;

  return (
    <div className={classes.container}>
      <div className={classes.sidebar}>
        <img
          src={coin?.image?.large || cachedCoin?.image}
          alt={coin?.name || cachedCoin?.name}
          height="200"
          style={{ marginBottom: 20 }}
        />
        <Typography variant="h3" className={classes.heading}>
          {coin?.name || cachedCoin?.name}
        </Typography>
        <Typography variant="subtitle1" className={classes.description}>
          <span dangerouslySetInnerHTML={{ __html: coin?.description?.en?.split(". ")[0] || "Fetching details..." }} />.
        </Typography>
        <div className={classes.marketData}>
          <span style={{ display: "flex" }}>
            <Typography variant="h5" className={classes.heading}>
              Rank:
            </Typography>
            &nbsp; &nbsp;
            <Typography
              variant="h5"
              style={{
                fontFamily: "Montserrat",
              }}
            >
              {numberWithCommas(coin?.market_cap_rank || cachedCoin?.market_cap_rank || "")}
            </Typography>
          </span>

          <span style={{ display: "flex" }}>
            <Typography variant="h5" className={classes.heading}>
              Current Price:
            </Typography>
            &nbsp; &nbsp;
            <Typography
              variant="h5"
              style={{
                fontFamily: "Montserrat",
              }}
            >
              {symbol}{" "}
              {numberWithCommas(
                (coin?.market_data?.current_price?.[currency.toLowerCase()] || cachedCoin?.current_price || 0).toFixed(2)
              )}
            </Typography>
          </span>
          <span style={{ display: "flex" }}>
            <Typography variant="h5" className={classes.heading}>
              Market Cap:
            </Typography>
            &nbsp; &nbsp;
            <Typography
              variant="h5"
              style={{
                fontFamily: "Montserrat",
              }}
            >
              {symbol}{" "}
              {numberWithCommas(
                (coin?.market_data?.market_cap?.[currency.toLowerCase()] || cachedCoin?.market_cap || 0)
                  .toString()
                  .slice(0, -6)
              )}
              M
            </Typography>
          </span>
          
          <Button
            variant="contained"
            style={{
              width: "100%",
              height: 40,
              marginTop: 20,
              backgroundColor: inWatchlist ? "#ff4d4d" : "gold",
              color: inWatchlist ? "white" : "black",
              fontFamily: "Montserrat",
              fontWeight: "bold",
            }}
            onClick={() => {
              if (inWatchlist) {
                removeFromWatchlist(id);
              } else {
                addToWatchlist(id);
              }
            }}
          >
            {inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          </Button>
        </div>
      </div>
      <CoinInfo coin={coin} />
    </div>
  );
};

export default CoinPage;
