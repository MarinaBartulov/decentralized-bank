import { useState, useEffect } from "react";
import "./App.css";
import CustomNavbar from "./CustomNavbar";
import Transactions from "./Transactions";
import Home from "./Home";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Web3 from "web3";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [web3, setWeb3] = useState("undefined");
  const [netId, setNetId] = useState("");
  const [account, setAccount] = useState("");

  useEffect(() => {
    connectToMetaMask();
  }, []);

  const connectToMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const netId = await web3.eth.net.getId();
      const accounts = await web3.eth.getAccounts();
      if (typeof accounts[0] !== "undefined") {
        setAccount(accounts[0]);
        setWeb3(web3);
        setNetId(netId);
      } else {
        window.alert("Please login with MetaMask");
      }
    } else {
      window.alert("Please install MetaMask");
    }
  };

  return (
    <Router>
      <div className="App">
        <CustomNavbar account={account}></CustomNavbar>
        <ToastContainer className="mt-5" position="top-right" theme="colored" />
        <Routes>
          <Route
            path="/"
            element={<Home account={account} web3={web3} netId={netId} />}
          />
          <Route
            path="/home"
            element={<Home account={account} web3={web3} netId={netId} />}
          />
          <Route
            path="/transactions"
            element={
              <Transactions account={account} web3={web3} netId={netId} />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
