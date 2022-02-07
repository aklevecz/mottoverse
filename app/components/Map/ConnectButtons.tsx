type Props = {
  hasMetaMask: boolean;
  connect: () => void;
  walletConnect: () => void;
};

export default function ConnectButtons({
  hasMetaMask,
  connect,
  walletConnect,
}: Props) {
  return (
    <>
      {hasMetaMask && (
        <button
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            width: 220,
            marginLeft: -110,
            zIndex: 9,
            background: "#4879ff",
          }}
          onClick={connect}
        >
          MetaMask Connect
        </button>
      )}{" "}
      <button
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          width: 220,
          marginLeft: -110,
          zIndex: 9,
          background: "#4879ff",
        }}
        onClick={walletConnect}
      >
        Wallet Connect
      </button>
    </>
  );
}
