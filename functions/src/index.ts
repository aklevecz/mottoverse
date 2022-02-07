import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import { alphabetMap } from "./constants";
const cors = require("cors")({
  origin: true,
});

const adminConfig = require("./config.json");
admin.initializeApp({ credential: admin.credential.cert(adminConfig) });

const db = admin.firestore();

enum Collections {
  Words = "Words",
  Mottos = "Mottos",
}

export const test = functions.https.onRequest(async (req, res) => {
  const mottoArray = [33, 39];
  const words = [];
  for (let i = 0; i < mottoArray.length; i++) {
    const wordId = mottoArray[i];
    const doc = wordId.toString(16).padStart(64, "0");
    // const doc = wordId
    const wordString = (
      await db.collection(Collections.Words).doc(doc).get()
    ).data();
    words.push(wordString!.word);
  }
  console.log(words);
  res.send(words);
});

export const saveMetaData = functions.https.onRequest(
  async (request, response) => {
    return cors(request, response, async () => {
      const { event, args } = request.body;
      console.log(args);
      if (event === "WordCreated") {
        const { hexId, tokenId, word, wordArray } = args;
        await db
          .collection(Collections.Words)
          .doc(tokenId)
          .set({
            tokenId,
            hexId,
            word,
            wordArray,
            name: word,
            description: `desc ${word}`,
            // image: `https://mottoverse.s3.us-west-1.amazonaws.com/words/${tokenId}.png`,
            image: `https://cdn.mttvrs.com/words/${tokenId}.png`,
          });

        console.log("saving");
        response.send("good");
      } else if (event == "MottoCreated") {
        const { hexId, tokenId, mottoArray } = args;

        const words = [];
        for (let i = 0; i < mottoArray.length; i++) {
          const wordId = mottoArray[i];
          // const doc = parseInt(wordId).toString(16).padStart(64, "0");
          const doc = wordId;
          const wordString = (
            await db.collection(Collections.Words).doc(doc).get()
          ).data();
          words.push(wordString!.word);
        }
        const motto = words.join(" ");
        db.collection(Collections.Mottos)
          .doc(tokenId)
          .set({
            tokenId,
            hexId,
            mottoArray,
            name: motto,
            description: `desc`,
            // image: `https://mottoverse.s3.us-west-1.amazonaws.com/mottos/${tokenId}.png`,
            image: `https://cdn.mttvrs.com/mottos/${tokenId}.png`,
          });
        response.send(words);
      } else {
        response.send("Hello from !");
      }
      //   }
      // }
    });
  }
);
