import { BigNumber, ethers } from "ethers";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { MOTTOVERSE_ADDRESS } from "./constants";
import { useAccounts, useProvider } from "./Web3";

import MottoverseInterface from "../ethereum/contracts/Mottoverse.sol/Mottoverse.json";
import { alphabet } from "../constants";
import { Position } from "./types";
import { getMottos, getWords } from "../firebase";
import { getRandomInt } from "../libs/utils";
import { StateProvider } from "@builder.io/react";

export enum TxState {
  Idle,
  Signing,
  Minting,
  Completed,
  Error,
}

type Action =
  | { type: "initContract"; contract: ethers.Contract }
  | { type: "setSigner"; signer: ethers.providers.JsonRpcSigner }
  | { type: "updateTxState"; txState: TxState; txData?: any };

type Dispatch = (action: Action) => void;

type State = {
  contract: ethers.Contract | null;
  signer: ethers.providers.JsonRpcSigner | null;
  txState: TxState;
  txData: any;
};

const initialState = {
  contract: null,
  signer: null,
  txState: TxState.Idle,
  txData: null,
};

const defaultProvider = new ethers.providers.AlchemyProvider(
  "maticmum",
  process.env.NEXT_PUBLIC_ALCHEMY_KEY
);

const ContractContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      getContractSigner: () => ethers.Contract | null;
      updateTxState: (txState: TxState, txData?: any) => void;
    }
  | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "initContract":
      return { ...state, contract: action.contract };
    case "setSigner":
      return { ...state, signer: action.signer };
    case "updateTxState":
      return {
        ...state,
        txState: action.txState,
        txData: action.txData ? action.txData : null,
      };
    default:
      return state;
  }
};

const ContractProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const web3Provider = useProvider();
  const setContract = (contract: ethers.Contract) =>
    dispatch({ type: "initContract", contract });
  const setSigner = (signer: ethers.providers.JsonRpcSigner) => {
    dispatch({ type: "setSigner", signer });
  };

  useEffect(() => {
    const provider = web3Provider ? web3Provider : defaultProvider;
    const contract = new ethers.Contract(
      MOTTOVERSE_ADDRESS,
      MottoverseInterface.abi,
      provider
    );
    setContract(contract);
    if (web3Provider) {
      setSigner(web3Provider.getSigner());
    }
  }, [web3Provider]);

  const getContractSigner = () => {
    const signer = web3Provider?.getSigner();
    if (!signer) {
      console.error("needs signer");
      return null;
    }
    const contractSigner = state.contract?.connect(signer);
    return contractSigner ? contractSigner : null;
  };

  const updateTxState = (txState: TxState, txData?: any) =>
    dispatch({ type: "updateTxState", txState, txData });

  const value = { state, dispatch, getContractSigner, updateTxState };
  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

export { ContractContext, ContractProvider };

type TxResponse = {
  error?: string;
  data?: {
    tokenId?: number;
  };
  success: boolean;
};

type Tx = {
  txState: TxState;
  message: string;
};

export const useMottoverse = (lettersRef: any) => {
  const context = useContext(ContractContext);
  const provider = useProvider();
  const { accounts } = useAccounts();

  const [gold, setGold] = useState<null | number>(null);
  const [letters, setLetters] = useState<null | number[]>(null);
  const [words, setWords] = useState<null | any>(null);
  const [mottos, setMottos] = useState<null | any>(null);
  const [tx, setTx] = useState<Tx>({ txState: TxState.Idle, message: "Idle" });

  // REFAACTOR: this is dumb
  const letterCacheRef = useRef<number[]>([]);

  if (context === undefined) {
    throw new Error("Contract Context error in Mottoverse hook");
  }

  const {
    state: { contract, signer },
    getContractSigner,
  } = context;

  const resetTx = () => setTx({ txState: TxState.Idle, message: "" });

  const updateLetters = (contract: any) => {
    contract
      .getLetterBalances()
      .then((letters: BigNumber[]) => {
        const letterCountsIndices = letters.map((letter: BigNumber) =>
          parseInt(letter as any)
        );
        setLetters(letterCountsIndices);
        lettersRef.current = letterCountsIndices;
        localStorage.setItem(
          "letter_cache",
          JSON.stringify(letterCountsIndices)
        );
      })
      .catch((e: any) => {
        console.log("get letter balances failed");
        console.log(e);
      });
  };

  const resetLetters = () => {
    const letterCache = JSON.parse(localStorage.getItem("letter_cache")!);
    lettersRef.current = letterCache;
    setLetters(letterCache);
  };

  const updateWords = () => {
    getWords().then((words) => {
      setWords(words);
    });
  };

  const updateMottos = () => {
    getMottos().then(setMottos);
  };

  const updateGoldSupply = () => {
    const contractSigner = getContractSigner();
    if (!contractSigner) {
      return console.error("no signer");
    }
    contractSigner.balanceOf(accounts[0], 0).then((gold: any) => {
      setGold(parseInt(gold));
    });
  };
  useEffect(() => {
    if (signer) {
      updateLetters(getContractSigner());
      updateGoldSupply();
    }
  }, [signer]);

  useEffect(() => {
    if (contract) {
      const contractSigner = getContractSigner();
      // if (!contractSigner) {
      //   return console.error("Missing signer");
      // }
      // if (contractSigner) {
      //   updateLetters(contractSigner);
      //   updateGoldSupply();
      // }
      updateWords();
      updateMottos();
      // contractSigner.uri(0).then(console.log);
      // contractSigner.mottoIds().then((id: any) => console.log(id.toString()));
      // console.log("what");
      // // contractSigner.ownerOf(27).then(console.log);
      // for (let i = 0; i < 5; i++) {
      //   contractSigner
      //     .words(i)
      //     .then((word: any) => {
      //       const wordId = parseInt(word);
      //       console.log(wordId);
      //       contractSigner.uri(wordId).then(console.log);
      //     })
      //     .catch(console.log);
      // }

      // contractSigner
      //   .mottos(0)
      //   .then((word: any) => {
      //     const wordId = parseInt(word);
      //     console.log(wordId);
      //     contractSigner.uri(wordId).then(console.log);
      //   })
      //   .catch(console.log);
    }
  }, [contract]);

  const getRandomLetter = async () => {
    const contractSigner = getContractSigner();
    if (!contractSigner) {
      return console.error("Missing signer");
    }
    setTx({ txState: TxState.Signing, message: "Waiting for signature" });

    const letters = [];
    const amounts = [];
    for (let i = 0; i <= 10; i++) {
      letters.push(getRandomInt(1, 27));
      amounts.push(2);
    }
    const res = await fetch("/api/get-random-letters").then((r) => r.json());
    const { signature, letterData } = res;
    // return;
    const tx = await contractSigner.getLetterBatch(letterData, signature);
    setTx({
      txState: TxState.Minting,
      message: "Your letters are being mined...",
    });
    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event === "TransferBatch") {
        const letter = alphabet[parseInt(event.args.id) - 1];
        setTimeout(() => {
          updateGoldSupply();
          updateLetters(contractSigner);
          setTx({
            txState: TxState.Completed,
            message: "You have new letters!",
          });
        }, 5000);
      }
    }
  };

  const API_ENDPOINT = "/api/hello";
  const createWord = async (word: string, imgBlob: Blob) => {
    setTx({ txState: TxState.Signing, message: "Waiting for signature" });
    const data = new FormData();
    data.append("img", imgBlob);
    data.append("word", word);
    data.append("event", "WordCreated");

    const contractSigner = getContractSigner();
    if (!contractSigner) {
      return console.error("Missing signer");
    }
    const wordArray = [];
    const counts: { [key: string]: number } = {};
    for (let i = 0; i < word.length; i++) {
      const letter = word.charAt(i).toUpperCase();
      const count = counts[letter];
      counts[letter] = count ? count + 1 : 1;
      wordArray.push(alphabet.indexOf(letter) + 1);
    }
    const props = Object.keys(counts).reduce(
      (pv: { letters: number[]; amounts: number[] }, letter: string) => {
        return {
          letters: [alphabet.indexOf(letter) + 1, ...pv.letters],
          amounts: [counts[letter], ...pv.amounts],
        };
      },
      { letters: [], amounts: [] }
    );
    const tx = await contractSigner.createWord(
      props.letters,
      props.amounts,
      wordArray
    );
    setTx({ txState: TxState.Minting, message: "Your word is being minted" });
    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event === "WordCreated") {
        console.log(event);
        setTx({
          txState: TxState.Completed,
          message: "Your word has been created",
        });
        const e = {
          event: {
            ...event,
            args: {
              word: event.args.word,
              tokenId: event.args.tokenId,
              ...event.args,
            },
          },
        };
        data.append("event", JSON.stringify(e));

        fetch(API_ENDPOINT, {
          method: "POST",
          body: data,
          // JSON.stringify({
          //   imgBuffer,
          //   event: {
          //     ...event,
          //     args: {
          //       word: event.args.word,
          //       tokenId: event.args.tokenId,
          //       ...event.args,
          //     },
          //   },
          // }
          // )
        }).then((r) => {
          console.log(r);
          // BAD
          setTimeout(() => updateWords(), 5000);
        });
      }
    }
  };

  const createMotto = async (motto: string, words: any[], imgBlob: Blob) => {
    // Transform string into id[] of word NFTs
    const contractSigner = getContractSigner();
    if (!contractSigner) {
      return console.error("Missing signer");
    }
    setTx({ txState: TxState.Signing, message: "Waiting for your signature." });
    const data = new FormData();
    data.append("img", imgBlob);
    data.append("motto", motto);
    // data.append("event", "MottoCreated");
    console.log(motto);
    const mottoWords = motto.toUpperCase().trim().split(" ");
    console.log(mottoWords, words);
    const mottoArray = mottoWords.map((mottoWord: string) => {
      return words.find((word) => mottoWord === word.word).tokenId;
    });
    console.log(mottoArray);

    const tx = await contractSigner.createMotto(mottoArray);
    setTx({
      txState: TxState.Minting,
      message: "Your motto is being minted...",
    });
    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event == "MottoCreated") {
        console.log(event);
        const e = {
          motto,
          event: {
            event: "MottoCreated",
            ...event,
            args: {
              motto: mottoArray,
              tokenId: event.args.tokenId,
              ...event.args,
            },
          },
        };
        setTx({
          txState: TxState.Completed,
          message: "Congratz! You have created a new motto!",
        });
        data.append("event", JSON.stringify(e));
        fetch(API_ENDPOINT, {
          method: "POST",
          body: data,
          // JSON.stringify({
          //   event: {
          //     ...event,
          //     args: {
          //       motto: mottoArray,
          //       tokenId: event.args.tokenId,
          //       ...event.args,
          //     },
          //   },
          // })
        }).then((r) => {
          setTimeout(() => updateMottos(), 5000);
        });
      }
    }
  };

  const placeMotto = async (motto: number, coords: Position) => {
    const contractSigner = getContractSigner();
    if (!contractSigner) {
      return console.error("Missing signer");
    }
    if (!coords.lat || !coords.lng) {
      return console.error("No coords");
    }
    setTx({ txState: TxState.Signing, message: "Waiting for your signature." });
    const lat = ethers.utils.formatBytes32String(coords.lat.toString());
    const lng = ethers.utils.formatBytes32String(coords.lng.toString());
    console.log(lat, lng, motto);
    const tx = await contractSigner.placeMotto(motto, lat, lng);
    setTx({
      txState: TxState.Minting,
      message: "Placing your motto into the metaverse...",
    });
    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event == "MottoPlaced") {
        setTx({
          txState: TxState.Completed,
          message: "Your motto has been placed!",
        });
        console.log(event);
      }
    }
  };

  const buyGold = async () => {
    const contractSigner = getContractSigner();
    if (!contractSigner) {
      return console.error("Missing signer");
    }
    setTx({ txState: TxState.Signing, message: "Waiting for signature" });
    console.log(contractSigner);
    const tx = await contractSigner.buyGold({
      value: ethers.utils.parseEther("0.01"),
    });
    setTx({ txState: TxState.Minting, message: "Gold is being mined..." });
    const receipt = await tx.wait();
    for (const event of receipt.events) {
      if (event.event == "TransferSingle") {
        console.log(event);
        await updateGoldSupply();

        setTx({
          txState: TxState.Completed,
          message: "You have more gold now!",
        });
      }
    }
  };

  return {
    tx,
    resetTx,
    gold,
    letters,
    letterCacheRef,
    resetLetters,
    words,
    mottos,
    getRandomLetter,
    createWord,
    createMotto,
    placeMotto,
    buyGold,
  };
};

export const usePlacedMottos = (mottos: any) => {
  const context = useContext(ContractContext);
  const [placedMottos, setPlacedMottos] = useState<any[]>([]);

  if (context === undefined) {
    throw new Error("Contract Context error in PlacedMottos hook");
  }
  const {
    getContractSigner,
    state: { contract },
  } = context;

  const getPlacedMottos = async () => {
    if (!contract) {
      return console.error("no");
    }
    if (!mottos) {
      return console.error("no mottos");
    }

    const zeroString =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const placedMottos: any = [];
    for (let i = 0; i < mottos.length; i++) {
      const motto = mottos[i];
      const coords = await contract.Locales(motto.tokenId);
      if (coords.lat !== zeroString && coords.lng !== zeroString) {
        placedMottos.push({
          id: motto.tokenId,
          name: motto.name,
          image: motto.image,
          lat: parseFloat(ethers.utils.parseBytes32String(coords.lat)),
          lng: parseFloat(ethers.utils.parseBytes32String(coords.lng)),
        });
      }
    }
    return placedMottos;
  };

  return { getPlacedMottos };
};

export const useTxState = () => {
  const context = useContext(ContractContext);

  if (context === undefined) {
    throw new Error("Contract Context error in TxState hook");
  }

  const { state } = context;
  return { txState: state.txState, data: state.txData };
};
