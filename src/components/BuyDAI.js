import { useState } from 'react';
import './BuyDAI.css';
import logoDAI from '../assets/logoDAI.png';
import logoETH from '../assets/logoETH.jpg';
import logoImg from '../assets/logoImg.png';

function BuyDAI(props) {

  const [amountDAI, setAmountDAI] = useState(0);
  const [amountETH, setAmountETH] = useState(0);

  const handleEnterEther = async () => {

  }

  const handleAgainEther = async () => {

  }

return (
  <div className="main-div">
    <div className="card mb-4" >
       <div className="card-body card-DAI">
          <form className="mb-3" onSubmit={handleEnterEther}>
	          <div className="input-group mb-4">
	            <input
                  type="number"
                  onChange={e => setAmountDAI(e.target.value)}
                  className="form-control form-control-lg"
                  placeholder="Enter amount of DAI you want to buy"
                 />
	            <div className="input-group-append">
	              <div className="input-group-text ms-1">
	                <img src={logoDAI} height='34' alt=""/>
	                  &nbsp;&nbsp;&nbsp; DAI
	              </div>
	            </div>
	          </div>
	          <div className="input-group mb-2">
	            <input
	               type="number"
	               className="form-control form-control-lg"
	               placeholder="0"
	               value={amountETH}
	               disabled
	            />
	            <div className="input-group-append">
	              <div className="input-group-text ms-1">
	                <img src={logoETH} height='34' alt=""/>
	                &nbsp; ETH
	              </div>
	            </div>
	            </div>
	            <div className="mb-5">
	              <span className="float-left text-muted">Exchange Rate</span>
	              <span className="float-right text-muted">1 ETH = 100 DAI</span>
	            </div>
	            <button type="submit" className="btn btn-primary dai-btn">BUY DAI</button>
            </form>
        </div>
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

export default BuyDAI;