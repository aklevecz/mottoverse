const { createCanvas } = require("canvas");
const canvas = createCanvas(500, 500);
const ctx = canvas.getContext("2d");

export default function fitTextOnCanvas(
  text: string,
  fontface = "Arial",
  yPosition: number
) {
  var fontsize = 300;

  do {
    fontsize--;
    ctx.font = "bold " + fontsize + "px " + fontface;
  } while (ctx.measureText(text).width > canvas.width);

  // draw the text
  ctx.fillStyle = "#ff5353";
  ctx.fillText(text, 0, yPosition);
  const img = canvas.toDataURL();
  var data = img.replace(/^data:image\/\w+;base64,/, "");

  const buffer = Buffer.from(data, "base64");
  return buffer;
}
