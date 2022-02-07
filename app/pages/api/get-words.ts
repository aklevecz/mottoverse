// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
const { S3Client, ListObjectsCommand } = require("@aws-sdk/client-s3");

const host = "https://mottoverse.s3.us-west-1.amazonaws.com/metadata/";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  var params = {
    Bucket: "mottoverse" /* required */,
    Prefix: "metadata", // Can be your folder name
  };

  let client = new S3Client({
    region: "us-west-1",
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    },
  });
  const listObjectsCommand = new ListObjectsCommand(params);
  const list = await client.send(listObjectsCommand);
  const words = list.Contents.map((dataObject: any) => {
    if (dataObject.Key.includes(".json")) {
      return parseInt(dataObject.Key.split("/")[1], 16);
    }
    return "";
  }).filter((o: string) => o !== "");

  res.status(200).json(words);
}
