import { alphabet } from "../constants";
import { AnimatePresence, motion } from "framer-motion";
import Letter from "./Letter";
import styles from "../styles/Letter.module.css";
import { addListener } from "process";

type Props = {
  letters: any | null;
  lettersRef: any;
  addLetterToWord: (letter: string) => void;
};
export default function Letters({
  letters,
  lettersRef,
  addLetterToWord,
}: Props) {
  if (!letters) {
    return <div></div>;
  }
  console.log(letters, lettersRef.current);
  let l: any = [];
  letters?.map((_: any, i: number) => {
    const quantity = lettersRef.current[i];
    const letter = alphabet[i];
    if (quantity) {
      const letters = [];
      for (let j = 0; j < quantity; j++) {
        const id = `letter${i}${j}`;
        l.push(
          <Letter
            onClick={() => {
              //   document.getElementById(id)!.style.opacity = "0";
              //   setTimeout(() => {
              addLetterToWord(letter.toUpperCase());
              lettersRef.current[i]--;
              //     document.getElementById(id)!.style.opacity = "1";
              //   }, 500);
            }}
            letter={letter}
            id={id}
          />
        );
      }
    }
  });
  const letterCount = lettersRef.current.reduce((pv: number, cv: number) => {
    return pv + cv;
  }, 0);
  return (
    <motion.div layout className={styles.letters}>
      <div className={styles.letterContainer}>
        {/* {l.map((letter: any, n: any) => (
          <motion.div
            key={"letter" + n}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {letter}
          </motion.div>
        ))} */}
        {letters.map((_: any, i: number) => {
          const quantity = lettersRef.current[i];
          const letter = alphabet[i];
          const computedValue = 60 / (letterCount * 0.04);
          const dims = computedValue > 60 ? 60 : computedValue;
          return (
            <div
              key={letter}
              style={{
                cursor: "pointer",
                background: "white",
                color: "black",
                // padding: 10,
                margin: 5,
                flex: `0 0 ${dims}px`,
                height: dims,
                textAlign: "center",
                fontSize: "2rem",
                display: quantity ? "flex" : "none",
                position: "relative",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => {
                //   document.getElementById(id)!.style.opacity = "0";
                //   setTimeout(() => {
                addLetterToWord(letter.toUpperCase());
                lettersRef.current[i]--;
                //     document.getElementById(id)!.style.opacity = "1";
                //   }, 500);
              }}
            >
              {alphabet[i]}
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 5,
                  color: "#ff5353",
                  fontSize: 20,
                }}
              >
                {quantity}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
