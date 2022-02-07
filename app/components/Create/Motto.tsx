import { colors } from "../../contexts/constants";
import styles from "../../styles/Letter.module.css";
import Spinner from "../Spinner";

type Props = {
  words: any;
  onChangeMotto: any;
  onCreateMotto: any;
  addWordToMotto: any;
  motto: string;
  clearMotto: any;
  fetching: boolean;
};

export default function Motto(props: Props) {
  const hasWords = props.words && props.words.length > 0;
  return (
    <div>
      <div className="cta">Create a Motto!</div>
      {hasWords && <div className="sub-heading">Available Words</div>}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: 10,
          flexWrap: "wrap",
        }}
      >
        {props.words &&
          props.words.map((word: any) => {
            return (
              <div
                className={styles.word}
                key={word.word + word.tokenId}
                onClick={() => props.addWordToMotto(word.name)}
              >
                {word.name}
              </div>
            );
          })}
        {!hasWords && (
          <div
            style={{
              fontSize: "2rem",
              margin: "auto",
              width: "90%",
              textAlign: "center",
            }}
          >
            There are no available words. Go make one!
          </div>
        )}
      </div>

      <div className="input-button-container">
        <div className={styles.wordList} style={{ color: colors.red }}>
          {props.motto}
        </div>
        {/* <input type="text" onChange={props.onChangeMotto} /> */}
        <button onClick={props.onCreateMotto}>
          {props.fetching ? <Spinner /> : "Create Motto"}
        </button>
      </div>
      {props.motto && !props.fetching && (
        <button
          onClick={props.clearMotto}
          className="sm inverse"
          style={{ margin: "auto", display: "block" }}
        >
          Reset
        </button>
      )}
      <div
        style={{
          textAlign: "center",
          marginTop: 20,
          width: "80%",
          margin: "20px auto 0px",
        }}
      >
        Click on the available words above to make a motto
      </div>
    </div>
  );
}
