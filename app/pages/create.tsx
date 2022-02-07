// Create words
// Create mottos

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Acquire from "../components/Create/Acquire";
import Motto from "../components/Create/Motto";
import Tx from "../components/Create/Popup/Tx";
import Word from "../components/Create/Word";
import Letter from "../components/Letter";
import Letters from "../components/Letters";
import { alphabet } from "../constants";
import { useMottoverse, TxState } from "../contexts/Contract";
// import { TxState } from "../contexts/types";
import { useAccounts, useMetaMask, useWalletConnect } from "../contexts/Web3";
import drawFittedText from "../libs/drawFittedText";

import letterStyles from "../styles/Letter.module.css";

// this could be separate
// buy vs. create
// buy letters?
// buy gold

enum View {
  Word,
  Motto,
  Acquire,
}

export default function Create() {
  const { connect, hasMetaMask } = useMetaMask();
  const {
    connect: walletConnect,
    isWalletConnect,
    disconnect,
  } = useWalletConnect();
  const { accounts, hasWallet } = useAccounts();
  const lettersRef = useRef<number[]>([]);
  const {
    tx,
    resetTx,
    gold,
    letters,
    words,
    mottos,
    getRandomLetter,
    createWord,
    createMotto,
    placeMotto,
    buyGold,
    resetLetters,
  } = useMottoverse(lettersRef);
  const [word, setWord] = useState("");
  const [motto, setMotto] = useState("");

  const [view, setView] = useState<View>(View.Word);

  const router = useRouter();

  useEffect(() => {
    if (router.query.view) {
      setView(parseInt(router.query.view as string));
    }
  }, [router]);

  const changeView = (view: View) => {
    setView(view);
    router.push("/create?view=" + view);
  };

  const onChangeMotto = (e: React.FormEvent<HTMLInputElement>) => {
    setMotto(e.currentTarget.value);
  };

  const clearWord = () => {
    setWord("");
    resetLetters();
  };
  const clearMotto = () => setMotto("");

  const addLetterToWord = (letter: string) => {
    drawFittedText(word + letter);
    setWord(word + letter);
  };

  const addWordToMotto = (word: string) => {
    const newMotto = motto + " " + word;
    drawFittedText(newMotto.trim());

    setMotto(newMotto.trim());
  };

  const onChangeWord = (e: React.FormEvent<HTMLInputElement>) => {
    const word = e.currentTarget.value.replace(/ /g, "").toUpperCase();
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
      drawFittedText(word);
    }
  };

  const onCreateWord = () => {
    drawFittedText(word);
    const canvas = document.getElementById("c")! as HTMLCanvasElement;
    canvas.toBlob(async (blob) => {
      await createWord(word, blob!);
      clearWord();
    });
  };

  const onCreateMotto = () => {
    drawFittedText(motto);
    const canvas = document.getElementById("c")! as HTMLCanvasElement;
    canvas.toBlob(async (blob) => {
      await createMotto(motto, words, blob!);
      clearMotto();
    });
  };

  const fetching = tx.txState > TxState.Idle && tx.txState < TxState.Completed;

  return (
    <>
      <div
        className="container"
        style={{
          height: "100%",
          display: "grid",
          gridTemplateRows: "10% 80% 10%",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button className="sq">
            <Link href="/map">Go to Map</Link>
          </button>
        </div>
        {!hasWallet && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "2.5rem", textAlign: "center" }}>
              You must connect a wallet to play!
            </div>
            {hasMetaMask && (
              <button style={{ width: 200 }} onClick={connect}>
                MetaMask
              </button>
            )}
            <button style={{ width: 200 }} onClick={walletConnect}>
              Wallet Connect
            </button>
          </div>
        )}
        {hasWallet && (
          <>
            {tx.txState > 0 && <Tx tx={tx} resetTx={resetTx} />}
            {view === View.Word && (
              <Word
                letters={letters}
                lettersRef={lettersRef}
                word={word}
                onChangeWord={onChangeWord}
                onCreateWord={onCreateWord}
                addLetterToWord={addLetterToWord}
                fetching={fetching}
                clearWord={clearWord}
              />
            )}

            {view === View.Motto && (
              <Motto
                words={words}
                onChangeMotto={onChangeMotto}
                onCreateMotto={onCreateMotto}
                addWordToMotto={addWordToMotto}
                motto={motto}
                clearMotto={clearMotto}
                fetching={fetching}
              />
            )}
            {view === View.Acquire && (
              <Acquire
                hasWallet={hasWallet}
                gold={gold}
                connect={connect}
                getRandomLetter={getRandomLetter}
                buyGold={buyGold}
                letters={letters}
                fetching={fetching}
                isWalletConnect={isWalletConnect}
                disconnect={disconnect}
              />
            )}
            <div className="multi-button-container">
              <button
                className="sq sm"
                style={{ background: view === View.Word ? "red" : "white" }}
                onClick={() => changeView(View.Word)}
              >
                Words
              </button>
              <button
                className="sq sm"
                style={{ background: view === View.Motto ? "red" : "white" }}
                onClick={() => changeView(View.Motto)}
              >
                Mottos
              </button>
              <button
                className="sq sm"
                style={{ background: view === View.Acquire ? "red" : "white" }}
                onClick={() => changeView(View.Acquire)}
              >
                Acquire
              </button>
            </div>
            <canvas
              width="500"
              height="500"
              id="c"
              style={{ display: "none" }}
              //   style={{ background: "grey" }}
            />
          </>
        )}
      </div>
    </>
  );
}
