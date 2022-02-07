import { useEffect, useState, useRef } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useMottoverse, usePlacedMottos } from "../contexts/Contract";
import { useAccounts, useMetaMask, useWalletConnect } from "../contexts/Web3";
import styles from "../styles/Home.module.css";
import { useMap, useUserLocation } from "../contexts/Map";
import "../firebase";
import Place from "../components/Place";
import Link from "next/link";
import Tx from "../components/Create/Popup/Tx";
import ConnectButtons from "../components/Map/ConnectButtons";

const Home: NextPage = () => {
  const { connect, hasMetaMask } = useMetaMask();
  const { connect: walletConnect, disconnect } = useWalletConnect();
  const { accounts, hasWallet } = useAccounts();
  const lettersRef = useRef<number[]>([]);
  const { mottos, placeMotto, tx, resetTx } = useMottoverse(lettersRef);
  const { getPlacedMottos } = usePlacedMottos(mottos);
  const [showUI, setShowUI] = useState(true);
  const [selectedMotto, setSelectedMotto] = useState(0);
  const [startPlacingMotto, setStartPlacingMotto] = useState(false);

  const {
    map,
    mapContainer,
    batchCreateMottoMarkers,
    createDraggableMarker,
    removeDraggableMarker,
    placeMottoPosRef,
    initMap,
  } = useMap();
  const { userLocation } = useUserLocation();

  useEffect(() => {
    initMap();
  }, [initMap]);

  const updateMottoMarkers = () => {
    getPlacedMottos().then((placedMottos) => {
      batchCreateMottoMarkers(placedMottos, "mottos");
    });
  };

  useEffect(() => {
    if (mottos && mottos.length > 0 && map) {
      updateMottoMarkers();
    }
  }, [accounts, map, mottos]);
  const onPlaceMotto = async () => {
    // const pos = (window as any).globalClickPosition.lat
    //   ? (window as any).globalClickPosition
    //   : userLocation;
    removeDraggableMarker();
    const pos = placeMottoPosRef.current;
    if (pos.lat && pos.lng) {
      await placeMotto(selectedMotto, pos);
      updateMottoMarkers();
    } else {
      console.error("something is wrong");
    }
  };

  return (
    <div className={styles.container} style={{ height: "100%" }}>
      <Head>
        <title>Mottoverse</title>
        <meta name="description" content="Welcome to Mottoverse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {tx.txState > 0 && <Tx tx={tx} resetTx={resetTx} />}
      {!hasWallet && (
        <ConnectButtons
          connect={connect}
          walletConnect={walletConnect}
          hasMetaMask={hasMetaMask}
        />
      )}
      <Link href="/create">
        <button
          className=""
          style={{
            position: "absolute",
            left: "50%",
            top: 10,

            width: 150,
            zIndex: 9,
            borderRadius: 0,
            marginLeft: -75,
          }}
        >
          Resources
        </button>
      </Link>
      {startPlacingMotto && (
        <>
          <Place
            mottos={mottos}
            setSelectedMotto={setSelectedMotto}
            selectedMotto={selectedMotto}
            createDraggableMarker={createDraggableMarker}
            onPlaceMotto={onPlaceMotto}
          />
        </>
      )}
      <canvas width="500" height="500" id="c" style={{ display: "none" }} />
      <div style={{ width: "100%", height: "100%" }} ref={mapContainer}></div>
      {!startPlacingMotto && hasWallet && (
        <button
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            marginLeft: -75,
            width: 150,
            zIndex: 3,
          }}
          onClick={() => setStartPlacingMotto(true)}
        >
          Place Motto
        </button>
      )}
    </div>
  );
};

export default Home;
