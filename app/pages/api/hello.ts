// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import needle from "needle";
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
import fitTextOnCanvas from "../../libs/fitTextToCanvas";
import { alphabetMap } from "../../constants";
import formidable from "formidable";
import aws from "aws-sdk";

const fs = require("fs");

export const config = {
  api: {
    bodyParser: false,
  },
};

type Data = {
  name: string;
};

const meta = {
  name: "",
  description: "",
  image: "",
  type: "",
};

export default async function handler(req: any, res: NextApiResponse) {
  // const { activity } = req.body;
  // const { hash } = activity[0];
  // const { event, imgBuffer } = JSON.parse(req.body);
  aws.config.update({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    region: "us-west-1",
    signatureVersion: "v4",
  });
  // let client = new S3Client({
  //   region: "us-west-1",
  //   credentials: {
  //     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  //     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  //   },
  // });
  const s3 = new aws.S3();

  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    // console.log(files.img);
    // const { word } = req.body;
    // const word = "word";
    const prod =
      "https://us-central1-mottoverse.cloudfunctions.net/saveMetaData";
    // const dbEndPoint =
    //   process.env.NODE_ENV === "development"
    //     ? "http://localhost:5001/mottoverse/us-central1/saveMetaData"
    //     : "https://us-central1-mottoverse.cloudfunctions.net/saveMetaData";
    const dbEndPoint = prod;
    // console.log(hash);
    // console.log(hash);
    // const receipt = await provider.getTransactionReceipt(hash);
    // console.log(receipt);

    // if (receipt.logs.length > 1) {
    // for (let i = 0; i < receipt.logs.length; i++) {
    // const log = receipt.logs[i];
    // const r: any = mottoverse.interface.parseLog(log);
    // console.log(r);
    const r = JSON.parse(fields.event as string).event;
    const imgBuffer = await fs.readFileSync((files.img as any).filepath);

    if (r.event === "WordCreated") {
      const newMeta = Object.assign({}, meta, {});
      const wordArray = r.args.word;
      const word = wordArray
        .map((wordId: number) => alphabetMap[wordId])
        .join("");
      const bigId = r.args.tokenId;
      // HOOKS CHANGE
      const tokenId = parseInt(bigId.hex);
      const hexId = tokenId.toString(16).padStart(64, "0");

      newMeta.name = word;
      newMeta.description = `desc ${word}`;
      // newMeta.image = `https://mottoverse.s3.us-west-1.amazonaws.com/mottos/${tokenId}.png`;
      newMeta.image = `https://cdn.mttvrs.com/mottos/${tokenId}.png`;
      newMeta.type = "word";

      await needle.post(dbEndPoint, {
        event: r.event,
        args: {
          word,
          wordArray,
          hexId,
          tokenId,
        },
      });

      s3.upload(
        {
          Bucket: "mottoverse",
          Key: `words/${tokenId}.png`,
          Body: imgBuffer,
          ContentType: "image/png",
        },
        {},
        (err, data) => {
          if (err) console.log(err);
          s3.upload(
            {
              Bucket: "mottoverse",
              Key: `metadata/${hexId}.json`,
              Body: JSON.stringify(newMeta),
              ContentType: "application/json",
            },
            {},
            (err, data) => {
              if (err) console.log(err);
              res.status(200).send("ok");
            }
          );
        }
      );
    }
    console.log(r.event);
    if (r.event == "MottoCreated") {
      // array of word ids
      // HOOKS CHANGE
      const mottoArray = r.args.motto.map((m: any) => parseInt(m.hex));

      const bigId = r.args.tokenId;
      // HOOKS CHANGE
      let tokenId = parseInt(bigId.hex);
      if (isNaN(tokenId)) {
        tokenId = r.args.tokenId;
      }
      console.log(tokenId);
      const hexId = tokenId.toString(16).padStart(64, "0");
      await needle.post(dbEndPoint, {
        event: r.event,
        args: {
          mottoArray,
          hexId,
          tokenId,
        },
      });
      // const wordArray = res.body;
      // const wordArray = ["doc", "chicken"];
      const newMeta = Object.assign({}, meta, {});
      // const wordArray = r.args.word;
      // const motto = wordArray.join(" ");
      const motto = fields.motto as string;
      newMeta.name = motto;
      newMeta.description = `${motto}`;
      newMeta.image = `https://mottoverse.s3.us-west-1.amazonaws.com/mottos/${tokenId}.png`;
      newMeta.type = "motto";
      const metaParams = {
        Bucket: "mottoverse",
        Key: `metadata/${hexId}.json`,
        Body: JSON.stringify(newMeta),
        ContentType: "application/json",
      };
      console.log(imgBuffer);
      const imgParams = {
        Bucket: "mottoverse",
        Key: `mottos/${tokenId}.png`,
        Body: imgBuffer,
        ContentType: "image/png",
      };

      s3.upload(imgParams, {}, (err, data) => {
        if (err) console.log(err);

        s3.upload(metaParams, {}, (err, data) => {
          if (err) console.log(err);
          console.log("OK");
          res.status(200).send("ok");
        });
      });

      // client.send(metaCommand);
      // console.log("saving meta");
      // const buffer = fitTextOnCanvas(motto, "Arial", 250);
      // const imgCommand = new PutObjectCommand({
      //   Bucket: "mottoverse",
      //   Key: `mottos/${tokenId}.png`,
      //   Body: buffer,
      //   ContentType: "image/png",
      // });
      // client.send(imgCommand);
      // console.log("saving img");
    }
    // );
    // }
    // }
    // }
    //   console.log("hello");
    //   console.log(Object.keys(response));
    // S3
    // })();
    // res.status(200).json({ name: "John Doe" });
  });
  // S3
}
