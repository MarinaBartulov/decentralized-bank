// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./DBToken.sol";

contract DecentralizedBank {

	DBToken private dbToken;

	mapping(address => uint) public etherBalanceOf;
	mapping(address => uint) public depositStart;
	mapping(address => bool) public isDeposited;
	mapping(address => uint) public collateralEther;
	mapping(address => bool) public isBorrowed;

	event Deposit(address indexed user, uint etherAmount, uint timeStart);
	event Withdraw(address indexed user, uint etherAmount, uint depositTime, uint interest);
	event Borrow(address indexed user, uint collateralEtherAmount, uint borrowedTokenAmount);
	event PayOff(address indexed user, uint fee);

	// argument: deployed token contract
	constructor(DBToken _dbToken) {
		dbToken = _dbToken;
	}

	/**
	 * msg.sender must not have an active deposit
	 * min value to deposit is 0.01 ETH
	 */
	function deposit() payable public {
		require(isDeposited[msg.sender] == false, 'Error, deposit aleady active');
		require(msg.value >= 1e16, 'Error, deposit must be >= 0.01 ETH');

		etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
		depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;
		isDeposited[msg.sender] = true;
		emit Deposit(msg.sender, msg.value, block.timestamp);
	}

	/**
	 * msg.sender must have a previous deposit
	 * interest (10% APY) per second for minimum deposit (0.01 ETH) is 31668017
	 * 10% of 0.01 ETH = 1e15
	 * number of seconds in a year = 31577600
	 * interest = 1e15 / 31577600 = 31668017
	 * how much higher interest will be based on deposits: etherBalanceOf[msg.sender]/1e16
	 * for minimum deposit etherBalanceOf[msg.sender]/1e16 = 1 (31668017/s)
	 * for deposit 0.02 ETH, etherBalanceOf[msg.sender]/1e16 = 2 ((2*31668017)/s)
	 */
	function withdraw() public {
		require(isDeposited[msg.sender] == true, 'Error, no previous deposit');

		uint userBalance = etherBalanceOf[msg.sender];
		uint depositTime = block.timestamp - depositStart[msg.sender];
		uint interestPerSecond = 31668017 * (etherBalanceOf[msg.sender] / 1e16);
		uint interest = interestPerSecond * depositTime;

		// send deposited eth to user
		msg.sender.transfer(userBalance);
		// interest in tokens to user
		dbToken.mint(msg.sender, interest);

		depositStart[msg.sender] = 0;
		etherBalanceOf[msg.sender] = 0;
		isDeposited[msg.sender] = false;

		emit Withdraw(msg.sender, userBalance, depositTime, interest);

	}
}