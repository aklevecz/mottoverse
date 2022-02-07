import { useEffect, useState, FormEvent, useRef } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { alphabet } from "../constants";
import { useMottoverse, usePlacedMottos } from "../contexts/Contract";
import { useAccounts, useMetaMask } from "../contexts/Web3";
import styles from "../styles/Home.module.css";
import { useMap, useUserLocation } from "../contexts/Map";
import "../firebase";
import drawFittedText from "../libs/drawFittedText";
const Home: NextPage = () => {
  const { connect } = useMetaMask();
  const { accounts, hasWallet } = useAccounts();
  const lettersRef = useRef<number[]>([]);
  const {
    gold,
    letters,
    words,
    mottos,
    getRandomLetter,
    createWord,
    createMotto,
    placeMotto,
    buyGold,
  } = useMottoverse(lettersRef);
  const { getPlacedMottos } = usePlacedMottos(mottos);
  const [showUI, setShowUI] = useState(true);
  const [word, setWord] = useState("");
  const [motto, setMotto] = useState("");
  const [selectedMotto, setSelectedMotto] = useState(0);

  const [showLetters, setShowLetters] = useState(true);

  const toggleShowLetters = () => setShowLetters(!showLetters);
  const {
    map,
    mapContainer,
    createMottoMarkers,
    hideMarkers,
    initMap,
    loading,
  } = useMap();
  const { userLocation } = useUserLocation();

  useEffect(() => {
    initMap();
  }, [initMap]);

  useEffect(() => {
    if (mottos && mottos.length > 0 && map) {
      getPlacedMottos().then((placedMottos) => {
        placedMottos.forEach((placedMotto: any) => {
          createMottoMarkers(
            placedMotto.lat,
            placedMotto.lng,
            placedMotto.image
          );
        });
      });
    }
  }, [accounts, map, mottos]);
  const onChangeWord = (e: FormEvent<HTMLInputElement>) => {
    const word = e.currentTarget.value.replace(/ /g, "");
    let hasLetters = true;
    lettersRef.current = [...letters!];
    for (let i = 0; i < word.length; i++) {
      const char = word.charAt(i).toUpperCase();
      const letterId = alphabet.indexOf(char);
      if (lettersRef.current[letterId] > 0) {
        lettersRef.current[letterId]--;
      } else {
        hasLetters = false;
        console.log("you dont have this letter");
      }
    }
    if (hasLetters) {
      setWord(word);
    }
    console.log(lettersRef.current);
  };

  const onChangeMotto = (e: FormEvent<HTMLInputElement>) => {
    setMotto(e.currentTarget.value);
  };

  const onCreateWord = () => {
    drawFittedText(word);
    const canvas = document.getElementById("c")! as HTMLCanvasElement;
    canvas.toBlob(async (blob) => {
      createWord(word, blob!);
    });

    // var data = img.replace(/^data:image\/\w+;base64,/, "");

    // const buffer = Buffer.from(data, "base64");
    // console.log(buffer);
  };
  const testCreateWord = () => {
    drawFittedText(word);
    const canvas = document.getElementById("c")! as HTMLCanvasElement;
    canvas.style.display = "block";
    canvas.toBlob(async (blob) => {
      createWord(word, blob!);
    });
    console.log(canvas);
  };
  const onCreateMotto = () => {
    drawFittedText(motto);
    const canvas = document.getElementById("c")! as HTMLCanvasElement;
    canvas.toBlob(async (blob) => {
      createMotto(motto, words, blob!);
    });
  };

  const onPlaceMotto = () => {
    const pos = (window as any).globalClickPosition.lat
      ? (window as any).globalClickPosition
      : userLocation;
    console.log(pos);
    placeMotto(selectedMotto, pos);
  };

  // useEffect(() => {
  //   drawFittedText(word);
  // }, [word]);
  // useEffect(() => {
  //   drawFittedText(motto);
  // }, [motto]);
  return (
    <div className={styles.container}>
      <Head>
        <title>Mottoverse</title>
        <meta name="description" content="Welcome to Mottoverse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.ui} ${showUI ? "show" : styles.hide}`}>
        <div className={styles.top}>
          {accounts.map((account) => (
            <div className={styles.address} key={account}>
              {account}
            </div>
          ))}
        </div>
        <div
          className={`${styles.letters} ${showLetters ? "show" : styles.hide}`}
        >
          {letters?.map((letter, i) => (
            <div key={`${letter}-${i}`}>
              {alphabet[i]}
              {/* {letter} */}
              {lettersRef.current[i]}
            </div>
          ))}
          <button onClick={toggleShowLetters}>
            {showLetters ? "Hide" : "Show Letters"}
          </button>
        </div>

        <div className={styles.words}>
          {words &&
            words.map((word: any) => {
              return (
                <div key={word.word}>
                  {word.tokenId} - {word.name}
                </div>
              );
            })}
        </div>
        <div className={styles.mottos}>
          {mottos &&
            mottos.map((motto: any) => {
              return (
                <div
                  key={`${motto.name}`}
                  className={`${
                    selectedMotto === motto.tokenId ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedMotto(motto.tokenId);
                  }}
                >
                  {motto.tokenId} - {motto.name}
                </div>
              );
            })}
        </div>
        {/* <div>
          <input type="text" onChange={onChangeWord} value={word} />
          <button onClick={testCreateWord}>Test Create Word</button>
        </div> */}
        <div>
          <input type="text" onChange={onChangeWord} value={word} />
          <button onClick={onCreateWord}>Create Word</button>
        </div>
        <div>
          <input type="text" onChange={onChangeMotto} />
          <button onClick={onCreateMotto}>Create Motto</button>
        </div>
        <div>
          <button onClick={onPlaceMotto}>Place Motto</button>
          <button onClick={() => setShowUI(false)}>Hide UI</button>
        </div>
        <div className={styles.bottom}>
          {!hasWallet && <button onClick={connect}>Connect</button>}
          {hasWallet && (
            <>
              <button onClick={getRandomLetter}>get random letters</button>
              <div style={{ background: "black", color: "gold" }}>{gold}</div>
              <button onClick={buyGold}>buy Gold</button>
            </>
          )}
        </div>

        <div id="click-pos"></div>
        {/* <div>
        <button onClick={() => getUsersMottos(accounts[0])}>Get Mottos</button>
      </div> */}
      </div>
      {!showUI && (
        <button
          style={{ position: "absolute", bottom: 10, left: "30%", zIndex: 3 }}
          onClick={() => setShowUI(true)}
        >
          Show UI
        </button>
      )}
      <canvas width="500" height="500" id="c" style={{ display: "none" }} />
      <div
        style={{ width: "100%", height: "100%", minHeight: "100vh" }}
        ref={mapContainer}
      ></div>
    </div>
  );
};

export default Home;
