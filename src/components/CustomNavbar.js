import logo from '../assets/logo.png';
import './CustomNavbar.css';
import { Navbar, Nav } from 'react-bootstrap'
import Identicon from 'react-identicons';
import { Link } from 'react-router-dom';

function CustomNavbar(props) {

	return(
		<Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#/home" className="navbar-brand">
            <img
              alt=""
              src={logo}
              width="45"
              height="35"
              className="d-inline-block align-top"
            />{' '}
          Decentralized Bank
          </Navbar.Brand>
          <Navbar.Collapse className="justify-content-start" id="basic-navbar-nav">
            <Nav activeKey="/home" className="justify-content-end">
              <Link className="custom-link" to="/home">Home</Link>
              <Link className="custom-link" to="/transactions">Transactions</Link>
            </Nav>
          </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end" id="basic-navbar-nav">
          <Nav className="justify-content-end">
            <Nav.Link disabled>{props.account}</Nav.Link>
          </Nav>
          <Identicon size='35' string={props.account} className="identicon" />
        </Navbar.Collapse>
      </Navbar>
	)

}


export default CustomNavbar;