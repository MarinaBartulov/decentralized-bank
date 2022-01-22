import { useState, useEffect } from 'react';
import './Transactions.css';
import logoImg from '../assets/logoImg.png';
import DecentralizedBank from '../abis/DecentralizedBank.json';
import {Table} from 'react-bootstrap';

function Transactions(props) {

 const [events, setEvents] = useState([]);

  useEffect(() => {
    if(props.web3 !== 'undefined' && props.account !== '' && props.netId !== ''){
      getAccountsLogs();
    }
  },[props.web3, props.account, props.netId])


  const getAccountsLogs = async () => {
  	const decentralizedBank = new props.web3.eth.Contract(DecentralizedBank.abi, DecentralizedBank.networks[props.netId].address)
  	decentralizedBank.getPastEvents('allEvents', {
  		fromBlock: '0',
  		toBlock: 'latest'
  	}, (error, events) => { 
  		let eventsFiltered = events.filter(event => event.returnValues.user === props.account)
  		eventsFiltered.forEach(event => event.returnValues.timestamp = new Date(event.returnValues.timestamp*1000))
  		eventsFiltered.sort((a,b) => b.returnValues.timestamp - a.returnValues.timestamp)
  		setEvents(eventsFiltered)
  	});
  }

return (
  <div className="main-div">
  {props.account !== '' && (
  		<>
  			<h3>Transactions</h3>
		    <div className="card mb-4" >
		       <div className="card-body card-transactions">
		       		<Table hover size="sm" className="table-transactions">
							  <thead>
							    <tr>
							    	<th>#</th>
							      <th>Event</th>
							      <th>Time</th>
							    </tr>
							  </thead>
							  <tbody>
							  {events.map((event, i) => 
							  		<tr key={i}>
							  			<td>{i+1}</td>
								      <td>{event.event}</td>
								      <td>{new Date(event.returnValues.timestamp).toLocaleString()}</td>
							      </tr>
							  )}
							  </tbody>
							</Table>
		        </div>
		    </div>
  		</>
  	)
  }
  {props.account === '' && (
  		<h3>Please login with MetaMask to see your transactions</h3>
  	)
  }
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

export default Transactions;