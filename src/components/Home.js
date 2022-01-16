import { useState, useEffect } from 'react';
import logoImg from '../assets/logoImg.png';
import './Home.css';
import { Tabs, Tab } from 'react-bootstrap'
import CustomNavbar from './CustomNavbar';
import DBToken from '../abis/DBToken.json';
import DecentralizedBank from '../abis/DecentralizedBank.json';

function Home(props) {

  const [balance, setBalance] = useState(0);
  const [dbToken, setDbToken] = useState(null);
  const [decentralizedBank, setDecentralizedBank] = useState(null);
  const [decentralizedBankAddress, setDecentralizedBankAddress] = useState(null);
  const [dbTokenSymbol, setDbTokenSymbol] = useState("DBT");

  const [depositAmount, setDepositAmount] = useState(0);
  const [earnedInterest, setEarnedInterest] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [depositedAmount, setDepositedAmount] = useState(0);

  useEffect(() => {
    if(props.web3 !== 'undefined' && props.account !== '' && props.netId !== ''){
      loadBlockchainData();
    }
  },[props.web3, props.account, props.netId])

  const loadBlockchainData = async () => {
      const balance = await props.web3.eth.getBalance(props.account);
      setBalance(balance);

      try{
        const dbToken = new props.web3.eth.Contract(DBToken.abi, DBToken.networks[props.netId].address);
        const decentralizedBank = new props.web3.eth.Contract(DecentralizedBank.abi, DecentralizedBank.networks[props.netId].address)
        const decentralizedBankAddress = DecentralizedBank.networks[props.netId].address;
        const earnedInterest = await dbToken.methods.balanceOf(props.account).call()
        const dbTokenSymbol = await dbToken.methods.symbol().call();
        const depositedAmount = await decentralizedBank.methods.etherBalanceOf(props.account).call()
        setDbToken(dbToken);
        setDecentralizedBank(decentralizedBank);
        setDecentralizedBankAddress(decentralizedBankAddress);
        setDbTokenSymbol(dbTokenSymbol);
        setEarnedInterest(earnedInterest);
        setDepositedAmount(depositedAmount);

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
            Deposited amount: {depositedAmount} ETH <br></br>
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
