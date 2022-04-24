// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./DBToken.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DecentralizedBank {
    DBToken private dbToken;
    AggregatorV3Interface internal priceFeed;

    mapping(address => uint256) public etherBalanceOf;
    mapping(address => uint256) public depositStart;
    mapping(address => bool) public isDeposited;
    mapping(address => uint256) public collateralEther;
    mapping(address => bool) public isBorrowed;

    mapping(address => uint256) public earnedTokens;
    mapping(address => uint256) public borrowedTokens;

    event Deposit(
        address indexed user,
        uint256 etherAmount,
        uint256 timeStart,
        uint256 timestamp
    );
    event Withdraw(
        address indexed user,
        uint256 etherAmount,
        uint256 depositTime,
        uint256 interest,
        uint256 timestamp
    );
    event Borrow(
        address indexed user,
        uint256 collateralEtherAmount,
        uint256 borrowedTokenAmount,
        uint256 timestamp
    );
    event PayOff(address indexed user, uint256 fee, uint256 timestamp);

    // argument: deployed token contract
    constructor(DBToken _dbToken) {
        dbToken = _dbToken;
        priceFeed = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
    }

    /**
     * msg.sender must not have an active deposit
     * min value to deposit is 0.01 ETH
     */
    function deposit() public payable {
        require(
            isDeposited[msg.sender] == false,
            "Error, deposit aleady active"
        );
        require(msg.value >= 1e16, "Error, deposit must be >= 0.01 ETH");

        etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
        depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;
        isDeposited[msg.sender] = true;
        emit Deposit(msg.sender, msg.value, block.timestamp, block.timestamp);
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
        require(isDeposited[msg.sender] == true, "Error, no previous deposit");

        uint256 userBalance = etherBalanceOf[msg.sender];
        uint256 depositTime = block.timestamp - depositStart[msg.sender];
        uint256 interestPerSecond = 31668017 *
            (etherBalanceOf[msg.sender] / 1e16);
        uint256 interest = interestPerSecond * depositTime;

        // send deposited eth to user
        payable(msg.sender).transfer(userBalance);
        // interest in tokens to user
        dbToken.mint(msg.sender, interest);
        earnedTokens[msg.sender] += interest;

        depositStart[msg.sender] = 0;
        etherBalanceOf[msg.sender] = 0;
        isDeposited[msg.sender] = false;

        emit Withdraw(
            msg.sender,
            userBalance,
            depositTime,
            interest,
            block.timestamp
        );
    }

    /**
     * collateral must be >= 0.01 ETH
     * user must not have an active loan
     * Ether collateral will be locked until user pays off the loan
     * user gets 50% of collateral in tokens (that is what the user borrows)
     */
    function borrow() public payable {
        require(msg.value >= 1e16, "Error, collateral must be >= 0.01 ETH");
        require(isBorrowed[msg.sender] == false, "Error, loan already taken");

        collateralEther[msg.sender] = collateralEther[msg.sender] + msg.value;
        uint256 tokensToMint = collateralEther[msg.sender] / 2;
        dbToken.mint(msg.sender, tokensToMint);
        borrowedTokens[msg.sender] = tokensToMint;
        isBorrowed[msg.sender] = true;

        emit Borrow(
            msg.sender,
            collateralEther[msg.sender],
            tokensToMint,
            block.timestamp
        );
    }

    /**
     * user must have an active loan
     * tokens are transfered from user back to the contract
     * fee is 10% of collateral
     */
    function payOff() public {
        require(isBorrowed[msg.sender] == true, "Error, loan not active");
        require(
            dbToken.transferFrom(
                msg.sender,
                address(this),
                collateralEther[msg.sender] / 2
            ),
            "Error, can't receive tokens"
        ); //must approve dBank first

        uint256 fee = collateralEther[msg.sender] / 10;
        payable(msg.sender).transfer(collateralEther[msg.sender] - fee);
        collateralEther[msg.sender] = 0;
        borrowedTokens[msg.sender] = 0;
        isBorrowed[msg.sender] = false;

        emit PayOff(msg.sender, fee, block.timestamp);
    }

    function getLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }
}
