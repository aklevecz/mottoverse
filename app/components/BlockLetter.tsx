type Props = {
  show: boolean;
  children: JSX.Element | JSX.Element[] | string;
};

export default function BlockLetter({ show, children }: Props) {
  return (
    <div
      style={{
        background: "white",
        color: "black",
        padding: 10,
        margin: 5,
        flex: "0 0 50px",
        textAlign: "center",
        fontSize: "1.2rem",
        display: show ? "block" : "none",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
