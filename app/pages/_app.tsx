import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Web3Provider } from "../contexts/Web3";
import { ContractProvider } from "../contexts/Contract";
import { MapProvider } from "../contexts/Map";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <ContractProvider>
        <MapProvider>
          <Component {...pageProps} />
        </MapProvider>
      </ContractProvider>
    </Web3Provider>
  );
}

export default MyApp;
