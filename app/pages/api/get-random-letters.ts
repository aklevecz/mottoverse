// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { getRandomInt } from "../../libs/utils";
import { MOTTOVERSE_ADDRESS } from "../../contexts/constants";

const LIVE = process.env.NODE_ENV !== "development";

// confusing used main pp for mumbai
const PP = LIVE ? process.env.PP2 : process.env.PP_MAIN;

const ALCHEMY_KEY = LIVE
  ? process.env.ALCHEMY_KEY
  : process.env.ALCHEMY_KEY_MUMBAI;

const network = LIVE ? "matic" : "maticmum";
const defaultProvider = new ethers.providers.AlchemyProvider(
  network,
  ALCHEMY_KEY
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const wallet = new ethers.Wallet(PP as string, defaultProvider);

  const letterData: { letters: number[]; amounts: number[] } = {
    letters: [],
    amounts: [],
  };

  for (let i = 0; i < 10; i++) {
    letterData.letters.push(getRandomInt(1, 27));
    letterData.amounts.push(1);
  }

  const signature = await wallet._signTypedData(
    {
      name: "frogass",
      version: "1.0",
      chainId: await wallet.getChainId(),
      verifyingContract: MOTTOVERSE_ADDRESS,
    },
    {
      SignedLetterData: [
        { name: "letters", type: "uint256[]" },
        { name: "amounts", type: "uint256[]" },
      ],
    },
    letterData
  );
  res.status(200).json({ signature, letterData });
}
