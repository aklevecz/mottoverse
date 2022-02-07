import { ethers, providers } from "ethers";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

import WalletConnectProvider from "@walletconnect/web3-provider";
import { INFURA_KEY } from "./constants";

declare global {
  interface Window {
    ethereum: any;
  }
}

type Action =
  | { type: "setProvider"; provider: ethers.providers.Web3Provider }
  | { type: "setAccounts"; accounts: string[] };

type Dispatch = (action: Action) => void;

type State = {
  provider: ethers.providers.Web3Provider | null;
  accounts: string[];
};

const initialState = {
  provider: null,
  accounts: [],
};

const Web3Context = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      setProvider: (provider: ethers.providers.Web3Provider) => void;
      setAccounts: (accounts: string[]) => void;
    }
  | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "setProvider":
      return { ...state, provider: action.provider };
    case "setAccounts":
      return { ...state, accounts: action.accounts };
    default:
      return state;
  }
};

const Web3Provider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setProvider = (provider: ethers.providers.Web3Provider) =>
    dispatch({ type: "setProvider", provider });

  const setAccounts = (accounts: string[]) =>
    dispatch({ type: "setAccounts", accounts });

  const value = { state, dispatch, setProvider, setAccounts };
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export { Web3Context, Web3Provider };

export const useMetaMask = () => {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const context = useContext(Web3Context);

  if (context === undefined) {
    throw new Error("Web3 Context error in MetaMask hook");
  }

  const { setProvider, setAccounts } = context;

  const requestAccount = () => {
    return window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(async (accounts: string[]) => {
        return accounts;
      });
  };

  const connect = async () => {
    if (window.ethereum) {
      const accounts = await requestAccount();
      setAccounts(accounts);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      setHasMetaMask(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          connect();
        }
      });
    }
  }, []);

  return { connect, hasMetaMask };
};

export const useWalletConnect = () => {
  const [isWalletConnect, setIsWalletConnect] = useState(false);
  const [wcProvider, setWcProvider] = useState<
    WalletConnectProvider | undefined
  >(undefined);
  const context = useContext(Web3Context);

  if (context === undefined) {
    throw new Error("Web3 Context error in WalletConnect hook");
  }

  const {
    setProvider,
    setAccounts,
    state: { provider },
  } = context;

  const connect = async () => {
    const wcprovider = new WalletConnectProvider({
      // infuraId: INFURA_KEY,
      // chainId: 4,
      rpc: {
        80001:
          "https://polygon-mumbai.g.alchemy.com/v2/e9f3zs2O-BVmBkCXfZEUI-xmdt6wpzz9",
        137: "https://polygon-mainnet.g.alchemy.com/v2/Lxf62YcgEvOlb2EN6cZaRG4rvD92usKy",
      },
    });
    await wcprovider.enable();
    setWcProvider(wcprovider);
    const provider = new ethers.providers.Web3Provider(wcprovider);
    setProvider(provider);
    const accounts = await provider.listAccounts();
    console.log(provider);
    console.log(accounts);
    setAccounts(accounts);
    setIsWalletConnect(true);
  };

  const disconnect = () => {
    try {
      (wcProvider as any).disconnect();
      window.location.reload();
      setIsWalletConnect(false);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    const hasWallet = localStorage.getItem("walletconnect");
    if (hasWallet && JSON.parse(hasWallet).connected) {
      connect();
    }
  }, []);

  return { connect, disconnect, isWalletConnect };
};

export const useProvider = () => {
  const context = useContext(Web3Context);

  if (context === undefined) {
    throw new Error("Web3 Context error in Provider hook");
  }

  const { state } = context;

  return state.provider;
};

export const useAccounts = () => {
  const context = useContext(Web3Context);

  if (context === undefined) {
    throw new Error("Web3 Context error in Provider hook");
  }

  const { state } = context;

  return { accounts: state.accounts, hasWallet: state.accounts.length > 0 };
};
