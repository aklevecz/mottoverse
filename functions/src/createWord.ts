const { createCanvas } = require("canvas");
// const sharp = require("sharp");
// const fs = require("fs");
const canvas = createCanvas(500, 500);
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#ff5353";
ctx.fillRect(0, 0, 500, 500);

export default function fitTextOnCanvas(
  text: string,
  fontface = "Arial",
  yPosition: number
) {
  // start with a large font size
  var fontsize = 300;

  // lower the font size until the text fits the canvas
  do {
    fontsize--;
    ctx.font = fontsize + "px " + fontface;
  } while (ctx.measureText(text).width > canvas.width);

  // draw the text
  ctx.fillStyle = "black";
  ctx.fillText(text, 0, yPosition);
  const img = canvas.toDataURL();
  var data = img.replace(/^data:image\/\w+;base64,/, "");

  const buffer = Buffer.from(data, "base64");
  return buffer;
  // sharp(buffer)
  //   .png()
  //   .toFile(`./image.jpeg`)
  //   .catch(function (err: any) {
  //     console.log(err);
  //   });

  // fs.writeFileSync("./image.png", buffer);
}
// fitTextOnCanvas("hello", "Arial", 250);
