import { useState, useEffect } from "react";
import logoImg from "../assets/logoImg.png";
import "./Home.css";
import { Tabs, Tab } from "react-bootstrap";
import DBToken from "../abis/DBToken.json";
import DecentralizedBank from "../abis/DecentralizedBank.json";
import { toast } from "react-toastify";

function Home(props) {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [dbToken, setDbToken] = useState(null);
  const [decentralizedBank, setDecentralizedBank] = useState(null);
  const [decentralizedBankAddress, setDecentralizedBankAddress] =
    useState(null);
  const [dbTokenSymbol, setDbTokenSymbol] = useState("DBT");

  const [depositAmount, setDepositAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [earnedInterest, setEarnedInterest] = useState(0);
  const [depositedAmount, setDepositedAmount] = useState(0);
  const [collateralEther, setCollateralEther] = useState(0);
  const [borrowedTokens, setBorrowedTokens] = useState(0);

  const [key, setKey] = useState("deposit");
  const [toastMsg, setToastMsg] = useState("");
  const [usdValue, setUsdValue] = useState(0);

  useEffect(() => {
    if (
      props.web3 !== "undefined" &&
      props.account !== "" &&
      props.netId !== ""
    ) {
      loadBlockchainData();
    }
  }, [props.web3, props.account, props.netId]);

  useEffect(() => {
    if (key === "withdraw") {
      updateWithdrawTab();
    } else if (key === "earnedInterest") {
      updateEarnedInterestTab();
    } else if (key === "payOff") {
      updatePayOffTab();
    }
  }, [key]);

  useEffect(() => {
    if (toastMsg !== "") {
      toast.success(toastMsg);
    }
  }, [toastMsg]);

  const loadBlockchainData = async () => {
    const balance = await props.web3.eth.getBalance(props.account);
    setBalance(balance);
    setAccount(props.account);

    try {
      const dbToken = new props.web3.eth.Contract(
        DBToken.abi,
        DBToken.networks[props.netId].address
      );
      const decentralizedBank = new props.web3.eth.Contract(
        DecentralizedBank.abi,
        DecentralizedBank.networks[props.netId].address
      );
      const decentralizedBankAddress =
        DecentralizedBank.networks[props.netId].address;
      const dbTokenSymbol = await dbToken.methods.symbol().call();
      setDbToken(dbToken);
      setDecentralizedBank(decentralizedBank);
      setDecentralizedBankAddress(decentralizedBankAddress);
      setDbTokenSymbol(dbTokenSymbol);

      decentralizedBank.events.Deposit(
        {
          fromBlock: "latest",
        },
        (error, event) => {
          setToastMsg("Deposit successful!");
          setDepositAmount(0);
        }
      );

      decentralizedBank.events.Withdraw(
        {
          fromBlock: "latest",
        },
        (error, event) => {
          setToastMsg("Withdrawal successful!");
          setDepositedAmount(0);
        }
      );

      decentralizedBank.events.Borrow(
        {
          fromBlock: "latest",
        },
        (error, event) => {
          setToastMsg("Borrowing successful!");
          setBorrowAmount(0);
        }
      );

      decentralizedBank.events.PayOff(
        {
          fromBlock: "latest",
        },
        (error, event) => {
          setToastMsg("Payoff successful!");
          setBorrowedTokens(0);
          setCollateralEther(0);
        }
      );
    } catch (e) {
      console.log("Error", e);
      window.alert("Contracts not deployed to the current network");
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (props.web3 === "undefined") {
      toast.error("You have to install MetaMask first!");
      return;
    }
    setToastMsg("");
    let amount = depositAmount * 10 ** 18;
    if (decentralizedBank !== null) {
      try {
        await decentralizedBank.methods
          .deposit()
          .send({ value: amount.toString(), from: account });
      } catch (e) {
        console.log("Error, deposit: ", e);
      }
    } else {
      toast.error("Switch to the correct network.");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (props.web3 === "undefined") {
      toast.error("You have to install MetaMask first!");
      return;
    }
    setToastMsg("");
    if (decentralizedBank !== null) {
      try {
        await decentralizedBank.methods.withdraw().send({ from: account });
      } catch (e) {
        console.log("Error, withdraw: ", e);
      }
    } else {
      toast.error("Switch to the correct network.");
    }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (props.web3 === "undefined") {
      toast.error("You have to install MetaMask first!");
      return;
    }
    setToastMsg("");
    let amount = borrowAmount * 10 ** 18;
    if (decentralizedBank !== null) {
      try {
        await decentralizedBank.methods
          .borrow()
          .send({ value: amount.toString(), from: account });
      } catch (e) {
        console.log("Error, borrow: ", e);
      }
    } else {
      toast.error("Switch to the correct network.");
    }
  };

  const handlePayOff = async (e) => {
    e.preventDefault();
    if (props.web3 === "undefined") {
      toast.error("You have to install MetaMask first!");
      return;
    }
    setToastMsg("");
    if (decentralizedBank !== null) {
      try {
        const collateralEther = await decentralizedBank.methods
          .collateralEther(account)
          .call({ from: account });
        const tokenBorrowed = collateralEther / 2;
        await dbToken.methods
          .approve(decentralizedBankAddress, tokenBorrowed.toString())
          .send({ from: account });
        await decentralizedBank.methods.payOff().send({ from: account });
      } catch (e) {
        console.log("Error, pay off: ", e);
      }
    } else {
      toast.error("Switch to the correct network.");
    }
  };

  const updateWithdrawTab = async () => {
    if (decentralizedBank !== null) {
      const depositedAmount = await decentralizedBank.methods
        .etherBalanceOf(props.account)
        .call();
      setDepositedAmount(props.web3.utils.fromWei(depositedAmount));
    }
  };

  const updateEarnedInterestTab = async () => {
    if (decentralizedBank !== null) {
      const earnedInterest = await decentralizedBank.methods
        .earnedTokens(props.account)
        .call();
      setEarnedInterest(props.web3.utils.fromWei(earnedInterest));
    }
  };

  const updatePayOffTab = async () => {
    if (decentralizedBank !== null) {
      const collateralEther = await decentralizedBank.methods
        .collateralEther(props.account)
        .call();
      setCollateralEther(props.web3.utils.fromWei(collateralEther));
      const borrowedTokens = await decentralizedBank.methods
        .borrowedTokens(props.account)
        .call();
      setBorrowedTokens(props.web3.utils.fromWei(borrowedTokens));
    }
  };

  const updateUSDValue = async (ethValue) => {
    const price = await decentralizedBank.methods.getLatestPrice().call();
    setUsdValue(Math.round((price / 100000000) * ethValue * 100) / 100);
  };

  return (
    <div>
      <div className="div-tabs">
        <Tabs
          fill
          activeKey={key}
          onSelect={(k) => setKey(k)}
          id="uncontrolled-tab-example"
          className="tabs"
        >
          <Tab eventKey="deposit" title="Deposit" className="tab">
            <div>
              <br></br>
              How much do you want to deposit?
              <br></br>
              (min. amount is 0.01 ETH)
              <br></br>
              (1 deposit is possible at the time)
              <br></br>
              <form onSubmit={handleDeposit}>
                <div className="form-group mr-sm-2 input">
                  <br></br>
                  <input
                    id="depositAmount"
                    step="0.01"
                    type="number"
                    className="form-control form-control-md"
                    placeholder="Deposit Amount"
                    required
                    min="0.01"
                    value={depositAmount}
                    onChange={(event) => {
                      setDepositAmount(event.target.value);
                      updateUSDValue(event.target.value);
                    }}
                  />
                </div>
                {depositAmount != "" && <p>ETH value = {usdValue} USD</p>}
                <button
                  type="submit"
                  className="btn btn-primary mt-2 mb-2 tab-btn"
                >
                  DEPOSIT
                </button>
              </form>
            </div>
          </Tab>
          <Tab eventKey="withdraw" title="Withdraw" className="tab">
            <br></br>
            Do you want to withdraw + take interest?<br></br>
            Deposited amount: {depositedAmount} ETH <br></br>
            <br></br>
            <br></br>
            <div>
              <button
                type="submit"
                className="btn btn-primary mt-2 mb-2 tab-btn"
                onClick={handleWithdraw}
              >
                WITHDRAW
              </button>
            </div>
          </Tab>
          <Tab
            eventKey="earnedInterest"
            title="Earned Interest"
            className="tab"
          >
            <br></br>
            Earned Interest: {earnedInterest} {dbTokenSymbol}
            <br></br>
            <br></br>
          </Tab>
          <Tab eventKey="borrow" title="Borrow" className="tab">
            <div>
              <br></br>
              Do you want to borrow tokens?
              <br></br>
              (You'll get 50% of collateral, in DBT Tokens)
              <br></br>
              Type collateral amount (in ETH)
              <br></br>
              Collateral must be &gt;= 0.01 ETH
              <br></br>
              <br></br>
              <form onSubmit={handleBorrow}>
                <div className="form-group mr-sm-2 input">
                  <input
                    id="borrowAmount"
                    step="0.01"
                    min="0.01"
                    type="number"
                    value={borrowAmount}
                    onChange={(event) => setBorrowAmount(event.target.value)}
                    className="form-control form-control-md"
                    placeholder="Collateral Amount"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary mt-2 mb-2 tab-btn"
                >
                  BORROW
                </button>
              </form>
            </div>
          </Tab>
          <Tab eventKey="payOff" title="Payoff" className="tab">
            <div>
              <br></br>
              Do you want to payoff the loan?
              <br></br>
              (You'll receive your collateral - fee)
              <br></br>
              Your collateral: {collateralEther} ETH<br></br>
              Borrowed tokens: {borrowedTokens} {dbTokenSymbol}
              <br></br>
              <br></br>
              <button
                type="submit"
                className="btn btn-primary mt-2 mb-2 tab-btn"
                onClick={handlePayOff}
              >
                PAYOFF
              </button>
            </div>
          </Tab>
        </Tabs>
      </div>
      <div className="div-image mt-3">
        <img
          alt=""
          src={logoImg}
          width="200"
          height="190"
          className="d-inline-block align-top mt-3"
        />
      </div>
    </div>
  );
}

export default Home;
