import BlockLetter from "../BlockLetter";
import Letters from "../Letters";
import Spinner from "../Spinner";

type Props = {
  letters: any;
  lettersRef: any;
  addLetterToWord: any;
  onChangeWord: any;
  onCreateWord: any;
  word: any;
  fetching: boolean;
  clearWord: any;
};
export default function Word(props: Props) {
  const hasLetters =
    props.letters && props.letters.find((letter: number) => letter > 0);

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <div className="cta">Make a Word!</div>
      <Letters
        letters={props.letters}
        lettersRef={props.lettersRef}
        addLetterToWord={props.addLetterToWord}
      />

      <div className="input-button-container">
        {/* <input type="text" onChange={props.onChangeWord} value={props.word} /> */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {Array.from(props.word as string).map((letter: string) => (
            <BlockLetter show={true}>{letter}</BlockLetter>
          ))}
          {!hasLetters && (
            <div style={{ fontSize: "2rem" }}>You don't have any letters</div>
          )}
        </div>
        <button
          style={{ marginTop: 32 }}
          className="btn"
          onClick={props.onCreateWord}
        >
          {props.fetching ? <Spinner /> : "Create Word"}
        </button>
        {props.word && !props.fetching && (
          <button
            onClick={props.clearWord}
            className="sm inverse"
            style={{ margin: "auto", display: "block" }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
