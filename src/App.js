import React from "react"
import "./styles/App.css";
import "./styles/Header.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./Home";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";

function App() {
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 1337],
  });

  const { active, account, library, connector, activate, deactivate } =
    useWeb3React();

  const connect = async () => {
    let provider = window.ethereum;
    if (typeof provider !== "undefined") {
      try {
        await activate(injected);
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Install metamask");
    }
  };

  const disconnect = async () => {
    try {
      deactivate();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <Header
        active={active}
        account={account}
        connect={connect}
        disconnect={disconnect}
      />
      <Home account={account} active={active} />
      <Footer />
    </div>
  );
}

export default App;
