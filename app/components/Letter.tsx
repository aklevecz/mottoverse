import styles from "../styles/Letter.module.css";
type Props = {
  letter: string;
  onClick: (param: any) => void;
  id: string;
};

export default function Letter({ letter, onClick, id }: Props) {
  return (
    <div id={id} onClick={onClick} className={styles.letter}>
      {letter}
    </div>
  );
}
