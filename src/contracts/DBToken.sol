// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

contract DBToken {

	uint256 public totalSupply; 
	string public name = "Decentralized Bank Token";
	string public symbol = "DBT";
	string public standard = "Decentralized Bank Token v1.0"; 
	address public minter;

	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);
	event MinterChanged(address indexed _from, address indexed _to);

	constructor() {
		 minter = msg.sender; 
	}

	function transfer(address _to, uint256 _value) public returns (bool success){
		require(balanceOf[msg.sender] >= _value, 'Error, not enough tokens to transfer.');
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;	
		emit Transfer(msg.sender, _to, _value);
		return true;
	}

	function approve(address _spender, uint256 _value) public returns (bool success){
		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
		require(balanceOf[_from] >= _value, 'Error, there is no enough amount to transfer.');
		require(allowance[_from][msg.sender] >= _value, 'Error, allowance is not big enough for transfer'); 
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;
		allowance[_from][msg.sender] -= _value;
		emit Transfer(_from, _to, _value);
		return true;
	}

	// bank will be the minter
	function passMinterRole(address dBank) public returns (bool){
		require(msg.sender == minter, 'Error, only owner can change minter role.');
		minter = dBank;
		emit MinterChanged(msg.sender, dBank);
		return true;
	}

	function mint(address account, uint256 amount) public {
		//check if msg.sender has minter role
		require(msg.sender == minter, 'Error, msg.sender does not have minter role.');
		require(account != address(0), 'ERC20: mint to the zero');
		totalSupply += amount;
		balanceOf[account] += amount;
		emit Transfer(address(0), account, amount);
	}

}

