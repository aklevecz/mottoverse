export default function drawFittedText(word: string) {
  const canvas = document.getElementById("c")! as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const wordArray = word.toUpperCase().split(" ");
  const maxLength = word.length / 10 + 10;
  const splitWord = wordArray.reduce(
    (pv: string[], cv: string) => {
      let newLine = false;
      const lastWord = pv[pv.length - 1];

      const appendedEntry = (lastWord + " " + cv).trim();
      if (lastWord.length >= maxLength) {
        newLine = true;
      }
      if (appendedEntry.length > maxLength) {
        newLine = true;
      }
      if (newLine) {
        pv.push(cv);
      } else {
        pv[pv.length - 1] = appendedEntry;
      }
      return pv;
    },
    [""]
  );
  // const splitWord = word.toUpperCase().match(/.{1,10}/g)!;
  const spacer = 0;

  const bottomLine = (bottom: number, i: number) =>
    bottom + bottom * 0.8 + (bottom * 1 + 20) * i;

  function fitTextOnCanvas(text: any, fontface: any, yPosition: any) {
    var fontsize = 300;

    let bottom = 0;
    let lastLine = 0;
    let textWidth = ctx.measureText(text).width;
    do {
      fontsize--;
      ctx.font = fontsize + "px " + fontface;
      bottom = ctx.measureText(text).fontBoundingBoxDescent * 2;
      lastLine = bottomLine(bottom, splitWord.length - 1);
      textWidth = ctx.measureText(text).width;
    } while (textWidth > canvas.width || lastLine > 440);

    return {
      bottom,
      fontsize,
    };
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FF3557";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "white";
  let longestWord = "";
  for (let i = 0; i < splitWord.length; i++) {
    if (splitWord[i].length > longestWord.length) {
      longestWord = splitWord[i];
    }
  }
  const { bottom, fontsize } = fitTextOnCanvas(
    longestWord,
    "Secular One",
    spacer
  );
  console.log(splitWord);
  splitWord.forEach((word, i) => {
    ctx.strokeText(word, 2, bottomLine(bottom, i));
    ctx.fillText(word, 2, bottomLine(bottom, i));
  });
}
