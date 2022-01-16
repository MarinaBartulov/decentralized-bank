import { useState, useEffect } from 'react';
import logoImg from '../assets/logoImg.png';
import './Home.css';
import { Tabs, Tab } from 'react-bootstrap'
import CustomNavbar from './CustomNavbar';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Web3 from 'web3';

function Home(props) {
  
  const [dbTokenSymbol, setDbTokenSymbol] = useState("DBT");

  const [depositAmount, setDepositAmount] = useState(0);
  const [earnedInterest, setEarnedInterest] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);

  useEffect(() => {
    loadBlockchainData();
  },[])

  const loadBlockchainData = async () => {

      try{
        //load smart contracts

      } catch(e){
        console.log('Error',e)
        window.alert('Contracts not deployed to the current network')
      }
  }
  
  const handleDeposit = async (e) => {
    e.preventDefault();
    console.log("Depositing...")
  }

  const handleWithdraw = async (e) => {
    e.preventDefault();
    console.log("Withdrawing...")
  }

  const handleBorrow = async (e) => {
    e.preventDefault();
    console.log("Borrowing...")
    let amount = borrowAmount
    amount = amount * 10**18
  }

  const handlePayOff = async (e) => {
    e.preventDefault();
    console.log("Paying Off...")
  }


  return (
    <div>
      <div className="div-tabs">
        <Tabs fill defaultActiveKey="deposit" id="uncontrolled-tab-example" className="tabs">
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
                  value={depositAmount}
                  onChange={event => setDepositAmount(event.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary mt-2 mb-2 tab-btn">DEPOSIT</button>
            </form>  
          </div>
          </Tab>
          <Tab eventKey="withdraw" title="Withdraw" className="tab">
          <br></br>
            Do you want to withdraw + take interest?<br></br>
            Deposited amount: 0.01 ETH <br></br>
            Earned Interest: {earnedInterest} {dbTokenSymbol}
            <br></br>
            <br></br>
          <div>
            <button type="submit" className="btn btn-primary mt-2 mb-2" onClick={handleWithdraw}>WITHDRAW</button>
          </div>
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
              Collateral must be >= 0.01 ETH
              <br></br>
              <br></br>
              <form onSubmit={handleBorrow}>
                <div className="form-group mr-sm-2 input">
                  <input
                    id="borrowAmount"
                    step="0.01"
                    type="number"
                    onChange={event => setBorrowAmount(event.target.value)}
                    className="form-control form-control-md"
                    placeholder="Borrow Amount"
                    required />
                </div>
                <button type="submit" className="btn btn-primary mt-2 mb-2">BORROW</button>
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
              <br></br>
              <button type="submit" className="btn btn-primary mt-2 mb-2" onClick={handlePayOff}>PAYOFF</button>
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
