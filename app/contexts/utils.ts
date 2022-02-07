export const idToNetwork: { [key: number]: string } = {
  1: "mainnet",
  4: "rinkeby",
  137: "polygon",
};

export const networkToId = {
  mainnet: 1,
  rinkeby: 4,
  polygon: 137,
};

export const ipfsToHttps = (uri: string) => uri.replace("ipfs", "https");

export const getMarker = (selector: string): any => {
  const MAX_TRIES = 100;
  let tries = 0;
  return new Promise((resolve, __) => {
    const pollMarker = (): any => {
      console.log("polling");
      const markerDom = document.querySelector(selector) as HTMLImageElement;
      if (!markerDom && tries < MAX_TRIES) {
        tries++;
        return setTimeout(pollMarker, 50);
      }
      return resolve(markerDom);
    };
    pollMarker();
  });
};

export const fadeIn = (el: HTMLElement) => {
  let o = 0;
  let frame = 0;
  const animate = () => {
    el.style.transform = `scale(${o})`;
    if (o < 1) {
      o += 0.05;
      frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
    }
  };
  animate();
};

export const delay = (ms: number, callback: Function) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      callback();
      resolve(true);
    }, ms);
  });
};
