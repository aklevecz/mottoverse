import { useState } from "react";
import { alphabet } from "../../constants";
import Spinner from "../Spinner";

type Props = {
  hasWallet: any;
  connect: any;
  getRandomLetter: any;
  gold: any;
  buyGold: any;
  letters: any;
  fetching: boolean;
  isWalletConnect: boolean;
  disconnect: () => void;
};

enum View {
  Letters,
  Gold,
}

const Gold = (props: any) => (
  <div style={{ marginBottom: 30 }}>
    <div>
      <div className="sub-heading" style={{ fontSize: "3rem" }}>
        Your gold
      </div>
      <div
        style={{
          background: "black",
          color: "gold",
          fontSize: "2.5rem",
          margin: "15px auto",
          textAlign: "center",
        }}
      >
        {props.gold}
      </div>
    </div>
    <button
      style={{ display: "block", margin: "20px auto" }}
      onClick={props.buyGold}
    >
      {props.fetching ? <Spinner /> : "Buy Gold"}
    </button>
    <div style={{ textAlign: "center" }}>100 Gold / .01 Matic</div>
  </div>
);
const Letters = (props: any) => (
  <>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        maxWidth: 600,
        margin: "auto",
        justifyContent: "center",
      }}
    >
      {props.letters &&
        props.letters.map((quantity: any, letterIndex: number) => (
          <div
            key={alphabet[letterIndex]}
            style={{
              cursor: "pointer",
              background: "white",
              color: "black",
              // padding: 10,
              margin: 5,
              flex: "0 0 60px",
              height: 60,
              textAlign: "center",
              fontSize: "2rem",
              display: quantity ? "flex" : "none",
              position: "relative",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {alphabet[letterIndex]}
            <span
              style={{
                position: "absolute",
                top: 0,
                right: 5,
                color: "#ff5353",
                fontSize: "1.5rem",
              }}
            >
              {quantity}
            </span>
          </div>
        ))}
    </div>
    {props.hasWallet && (
      <>
        <div style={{ marginBottom: 30 }}>
          <button
            className="lg"
            style={{ display: "block", margin: "20px auto" }}
            onClick={props.getRandomLetter}
          >
            {props.fetching ? <Spinner /> : "Buy Letters"}
          </button>
          <div style={{ textAlign: "center" }}>
            You can buy more letters for 100 gold
          </div>
        </div>
      </>
    )}
  </>
);
export default function Acquire(props: Props) {
  const [view, setView] = useState<View>(View.Letters);
  const goldView = () => setView(View.Gold);
  const letterView = () => setView(View.Letters);
  return (
    <div>
      <div className="cta">Acquire Resources</div>
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}
      >
        <button onClick={letterView} className="sm" style={{ margin: 5 }}>
          Letters
        </button>
        <button onClick={goldView} className="sm" style={{ margin: 5 }}>
          Gold
        </button>
      </div>
      {view === View.Letters && (
        <Letters
          letters={props.letters}
          hasWallet={props.hasWallet}
          fetching={props.fetching}
          getRandomLetter={props.getRandomLetter}
        />
      )}
      {view === View.Gold && (
        <Gold
          gold={props.gold}
          buyGold={props.buyGold}
          fetching={props.fetching}
        />
      )}
      {/* <button
            onClick={props.disconnect}
            className="inverse"
            style={{ marginTop: 70, margin: "auto", display: "block" }}
          >
            Disconnect
          </button> */}
    </div>
  );
}
