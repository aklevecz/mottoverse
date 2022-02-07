const { expect } = require("chai");
const { ethers } = require("hardhat");
const alphabet = [
  "",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const TOKEN_START = 27;

async function getLetter(letter, amount = 1) {
  const id = alphabet.indexOf(letter.toUpperCase());
  await this.mottoverse.getLetter(id, amount);
  return true;
}

async function makeWordArray(word) {
  const wordArray = [];
  for (let i = 0; i < word.length; i++) {
    const char = word.charAt(i).toUpperCase();
    const id = alphabet.indexOf(char);
    wordArray.push(id);
  }
  const { letters, amounts } = getLetterCounts(wordArray);
  return { word: wordArray, letters, amounts };
}

function getLetterCounts(word) {
  const counts = {};
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    const count = counts[letter];
    counts[letter] = count ? count + 1 : 1;
  }
  const props = Object.keys(counts).reduce(
    (pv, letter) => {
      return {
        letters: [letter, ...pv.letters],
        amounts: [counts[letter], ...pv.amounts],
      };
    },
    { letters: [], amounts: [] }
  );
  return props;
}

async function createWordBao() {
  await this.getLetter("b");
  await this.getLetter("a");
  await this.getLetter("o");
  const { word, letters, amounts } = await makeWordArray("bao");
  const tx = await this.mottoverse.createWord(letters, amounts, word);
  var receipt = await tx.wait();
  var wordCreatedEvent = receipt.events.find((x) => {
    return x.event == "WordCreated";
  });
  const wordId = parseInt(wordCreatedEvent.args.tokenId);
  return wordId;
}

async function createWord(w) {
  for (let i = 0; i < w.length; i++) {
    await this.getLetter(w.charAt(i));
  }
  const { word, letters, amounts } = await makeWordArray(w);
  const tx = await this.mottoverse.createWord(letters, amounts, word);
  var receipt = await tx.wait();
  var wordCreatedEvent = receipt.events.find((x) => {
    return x.event == "WordCreated";
  });
  const wordId = parseInt(wordCreatedEvent.args.tokenId);
  return wordId;
}

describe("Mottoverse", function () {
  beforeEach(async function () {
    this.Mottoverse = await ethers.getContractFactory("Mottoverse");
    this.mottoverse = await this.Mottoverse.deploy();
    await this.mottoverse.deployed();

    this.accounts = await ethers.getSigners();
    this.owner = this.accounts[0];
    this.notOwner = this.accounts[1];
    console.log("--", this.owner.address, this.notOwner.address, "--");

    const signer = this.mottoverse.connect(this.owner);
    await signer.safeTransferFrom(
      this.owner.address,
      this.notOwner.address,
      0,
      500,
      0x0
    );

    this.getLetter = getLetter.bind(this);
    this.createWordBao = createWordBao.bind(this);
    this.createWord = createWord.bind(this);
  });

  it("Can get letters with signature", async function () {
    const letterData = {
      letters: [],
      amounts: [],
    };

    for (let i = 0; i < 10; i++) {
      letterData.letters.push(getRandomInt(1, 27));
      letterData.amounts.push(1);
    }

    const signature = await this.owner._signTypedData(
      {
        name: "frogass",
        version: "1.0",
        chainId: await this.owner.getChainId(),
        verifyingContract: this.mottoverse.address,
      },
      {
        SignedLetterData: [
          { name: "letters", type: "uint256[]" },
          { name: "amounts", type: "uint256[]" },
        ],
      },
      letterData
    );
    const signer = this.mottoverse.connect(this.owner);
    await signer.getLetterBatch(letterData, signature);
    const firstLetter = await this.mottoverse.balanceOf(
      this.owner.address,
      letterData.letters[0]
    );

    expect(firstLetter.toNumber()).to.be.greaterThan(0);
  });
  it("Can't get letters with the wrong signature", async function () {
    const letterData = {
      letters: [],
      amounts: [],
    };

    for (let i = 0; i < 10; i++) {
      letterData.letters.push(getRandomInt(1, 27));
      letterData.amounts.push(1);
    }

    const signature = await this.notOwner._signTypedData(
      {
        name: "frogass",
        version: "1.0",
        chainId: await this.owner.getChainId(),
        verifyingContract: this.mottoverse.address,
      },
      {
        SignedLetterData: [
          { name: "letters", type: "uint256[]" },
          { name: "amounts", type: "uint256[]" },
        ],
      },
      letterData
    );
    const signer = this.mottoverse.connect(this.notOwner);
    await expect(
      signer.getLetterBatch(letterData, signature)
    ).to.be.revertedWith("Invalid signature");
  });
  it("Spell BAO", async function () {
    await this.getLetter("b");
    await this.getLetter("a");
    await this.getLetter("o");
    const { word, letters, amounts } = await makeWordArray("bao");
    await this.mottoverse.createWord(letters, amounts, word);
    const balanceOfBao = await this.mottoverse.balanceOf(
      this.owner.address,
      TOKEN_START
    );
    expect(parseInt(balanceOfBao)).to.equal(1);
  });
  it("Doesn't have the letters to spell BAO", async function () {
    await this.getLetter("b");
    await this.getLetter("a");
    const { word, letters, amounts } = await makeWordArray("bao");
    await expect(
      this.mottoverse.createWord(letters, amounts, word)
    ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
  });
  it("Cannot duplicate word", async function () {
    await this.createWord("bao");
    await expect(this.createWord("bao")).to.be.revertedWith("Word exists");
  });
  it("Can create a motto", async function () {
    const wordIds = [];
    var baoId = await this.createWord("bao");
    wordIds.push(baoId);

    var isId = await this.createWord("is");
    wordIds.push(isId);

    var cuteId = await this.createWord("cute");
    wordIds.push(cuteId);

    var tx = await this.mottoverse.createMotto(wordIds);
    var receipt = await tx.wait();
    const mottoCreatedEvent = receipt.events.find((x) => {
      return x.event == "MottoCreated";
    });
    const mottoId = parseInt(mottoCreatedEvent.args.tokenId);

    expect(
      parseInt(await this.mottoverse.balanceOf(this.owner.address, mottoId))
    ).to.equal(1);
  });
  it("Can place a motto", async function () {
    const wordId = this.createWordBao();
    const tx = await this.mottoverse.createMotto([wordId]);
    let receipt = await tx.wait();
    const mottoCreatedEvent = receipt.events.find((x) => {
      return x.event == "MottoCreated";
    });
    const mottoId = parseInt(mottoCreatedEvent.args.tokenId);
    const lat = ethers.utils.formatBytes32String("420");
    const lng = ethers.utils.formatBytes32String("69");
    await this.mottoverse.placeMotto(mottoId, lat, lng);

    const locale = await this.mottoverse.Locales(mottoId);
    expect(locale.lat).to.equal(lat);
    expect(locale.lng).to.equal(lng);
  });
  it("Can't place an already placed motto", async function () {
    const wordId = this.createWordBao();
    const tx = await this.mottoverse.createMotto([wordId]);
    let receipt = await tx.wait();
    const mottoCreatedEvent = receipt.events.find((x) => {
      return x.event == "MottoCreated";
    });
    const mottoId = parseInt(mottoCreatedEvent.args.tokenId);
    const lat = ethers.utils.formatBytes32String("420");
    const lng = ethers.utils.formatBytes32String("69");
    await this.mottoverse.placeMotto(mottoId, lat, lng);
    await expect(
      this.mottoverse.placeMotto(mottoId, lat, lng)
    ).to.be.revertedWith("This motto has already been placed");
  });
  it("Can release a motto", async function () {
    const makeAndPlace = async (motto) => {
      const tx = await this.mottoverse.createMotto(motto);
      let receipt = await tx.wait();
      const mottoCreatedEvent = receipt.events.find((x) => {
        return x.event == "MottoCreated";
      });
      const mottoId = parseInt(mottoCreatedEvent.args.tokenId);
      const lat = ethers.utils.formatBytes32String("420");
      const lng = ethers.utils.formatBytes32String("69");
      await this.mottoverse.placeMotto(mottoId, lat, lng);
    };
    var w1 = await this.createWord("a");
    var w2 = await this.createWord("b");
    var w3 = await this.createWord("c");

    await makeAndPlace([w1]);
    await makeAndPlace([w2]);
    await makeAndPlace([w3]);
    await this.mottoverse.releaseMotto(w2);
  });
  it("Can pay for use of word", async function () {
    const notContract = await this.mottoverse.connect(this.notOwner);
    // await notContract.getLetter(0, 1000);
    // await notContract.buyGold({ value: ethers.utils.parseEther("0.1") });
    await this.getLetter("c");
    await this.getLetter("u");
    await this.getLetter("t");
    await this.getLetter("e");
    var { word, letters, amounts } = await makeWordArray("cute");
    var tx = await this.mottoverse.createWord(letters, amounts, word);
    var receipt = await tx.wait();
    var wordCreatedEvent = receipt.events.find((x) => {
      return x.event == "WordCreated";
    });
    const tokenId = parseInt(wordCreatedEvent.args.tokenId);
    const oldBalance = await notContract.balanceOf(this.notOwner.address, 0);

    await notContract.createMotto([tokenId]);
    const balance = await notContract.balanceOf(this.notOwner.address, 0);
    expect(parseInt(balance)).to.equal(oldBalance.toNumber() - 100);
  });
  it("Can get letter balances", async function () {
    await this.getLetter("a");
    const balances = await this.mottoverse.getLetterBalances();
  });
});
