// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./DBToken.sol";

contract DecentralizedBank {

	DBToken private dbToken;

	// argument: deployed token contract
	constructor(DBToken _dbToken) {
		dbToken = _dbToken;
	}
}