import { TxState } from "../../../contexts/Contract";
import popStyles from "../../../styles/Pop.module.css";

type Props = {
  tx: { txState: TxState; message: string };
  resetTx: () => void;
};

const titleMap = {
  0: "",
  1: "Signature",
  2: "Mining",
  3: "Complete!",
  4: "Error!",
};

export default function Tx({ tx, resetTx }: Props) {
  return (
    <div className={popStyles.tx}>
      <div className={popStyles.title}>{titleMap[tx.txState]}</div>
      <div className={popStyles.content}>{tx.message}</div>
      {tx.txState >= 3 && (
        <button onClick={resetTx} className="inverse">
          Ok!
        </button>
      )}
    </div>
  );
}
