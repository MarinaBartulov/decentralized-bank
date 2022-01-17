import { EVM_REVERT } from './constants'
import { wait } from './utils'

const DBToken = artifacts.require('./DBToken')
const DecentralizedBank = artifacts.require('./DecentralizedBank')

require('chai')
	.use(require('chai-as-promised'))
	.should()


contract('decentralizedBank', ([deployer, user]) => {
	let decentralizedBank, dbToken
	const interestPerSecond = 31668017

	beforeEach(async () => {
		dbToken = await DBToken.new()
		decentralizedBank = await DecentralizedBank.new(dbToken.address)
		await dbToken.passMinterRole(decentralizedBank.address, { from: deployer})
	})

	describe('testing deposit...', () => {
		let balance

		describe('success', () => {
			beforeEach(async () => {
				await decentralizedBank.deposit({value: 10**16, from: user}) // 0.01 ETH
			})

			it('balance should increase', async () => {
				expect(Number(await decentralizedBank.etherBalanceOf(user))).to.eq(10**16)
			})

			it('deposit time should > 0', async () => {
				expect(Number(await decentralizedBank.depositStart(user))).to.be.above(0)
			})

			it('deposit status should eq true', async () => {
				expect(await decentralizedBank.isDeposited(user)).to.eq(true)
			})
		})

		describe('failure', () => {
			it('depositing should be rejected', async () => {
				await decentralizedBank.deposit({value: 10**15, from: user}).should.be.rejectedWith(EVM_REVERT) //too small amount
			})
		})
	})

	describe('testing withdraw...', () => {
		let balance

		describe('success', () => {

			beforeEach(async() => {
				await decentralizedBank.deposit({value: 10**16, from: user})
				await wait(2) // accruing interes
				balance = await web3.eth.getBalance(user)
				await decentralizedBank.withdraw({from: user})
			})

			it('balances should decrease', async () => {
				expect(Number(await web3.eth.getBalance(decentralizedBank.address))).to.eq(0)
				expect(Number(await decentralizedBank.etherBalanceOf(user))).to.eq(0)
			})

			it('user should receive ether back', async () => {
				expect(Number(await web3.eth.getBalance(user))).to.be.above(Number(balance))
			})

			it('user should receive proper amount of interest', async () => {
				balance = Number(await dbToken.balanceOf(user))
				expect(balance).to.be.above(0)
				expect(balance%interestPerSecond).to.eq(0)
				// time synchronization problem makes us check the 1-3s range for 2s deposit time
				expect(balance).to.be.below(interestPerSecond*4)
				expect(Number(await decentralizedBank.earnedTokens(user))).to.be.below(interestPerSecond*4)
				
			})

			it('depositer data should be reseted', async () => {
				expect(Number(await decentralizedBank.depositStart(user))).to.eq(0)
				expect(Number(await decentralizedBank.etherBalanceOf(user))).to.eq(0)
				expect(await decentralizedBank.isDeposited(user)).to.eq(false)
			})
		})

		describe('failure', () => {
			it('withdrawing should be rejected', async () => {
				await decentralizedBank.deposit({value: 10**16, from: user})
				await wait(2)
				await decentralizedBank.withdraw({from: deployer}).should.be.rejectedWith(EVM_REVERT) //wrong user
			})
		})
	})

	describe('testing borrow...', async () => {
		describe('success', async () => {
			it('user should successfully borrow the tokens', async () => {
				let value = 10**18
				const receipt = await decentralizedBank.borrow({value: value, from: user})
				expect(Number(await dbToken.balanceOf(user))).to.eq(value/2)
				expect(Number(await decentralizedBank.borrowedTokens(user))).to.eq(value/2)
				expect(Number(await decentralizedBank.collateralEther(user))).to.eq(value)
				expect(await decentralizedBank.isBorrowed(user)).to.eq(true)
				expect(receipt.logs[0].event).to.be.eq('Borrow')
				expect(receipt.logs[0].args.user).to.be.eq(user)
				expect(Number(receipt.logs[0].args.collateralEtherAmount)).to.eq(value)
				expect(Number(receipt.logs[0].args.borrowedTokenAmount)).to.eq(value/2)
			})
		})

		describe('failure', async () => {
			it('borrow should be rejected because of insufficient amount', async () => {
				let value = 10**15
				await decentralizedBank.borrow({value: value, from: user}).should.be.rejectedWith(EVM_REVERT)
			})

			it('borrow should be rejected because user already borrowed', async () => {
				let value = 10**18
				await decentralizedBank.borrow({value: value, from: user})
				await decentralizedBank.borrow({value: value, from: user}).should.be.rejectedWith(EVM_REVERT)

			})
		})
	})

	describe('testing pay off...', async () => {
		describe('success', async () => {
			it('user should successfully pay off the loan...', async () => {
				let value = 10**18
				let balance = await web3.eth.getBalance(user)
				await decentralizedBank.borrow({value: value, from: user})
				await dbToken.approve(decentralizedBank.address, BigInt(value/2), {from: user})
				await decentralizedBank.payOff({from: user})
				expect(Number(await dbToken.balanceOf(user))).to.eq(0)
				expect(Number(await decentralizedBank.collateralEther(user))).to.eq(0)
				expect(await decentralizedBank.isBorrowed(user)).to.eq(false)
			    let balanceAfter = await web3.eth.getBalance(user)
				expect(Number(balance)).to.be.above(Number(balanceAfter))
				expect(Number(await decentralizedBank.borrowedTokens(user))).to.eq(0)
			})
		})

		describe('failure', async () => {
			it('payOff should be rejected because user does not have an active loan', async () => {
				await decentralizedBank.payOff({from: user}).should.be.rejectedWith(EVM_REVERT)
			})

			it('borrow should be rejected because transfer was not approved for dBank', async () => {
		
				let value = 10**18
				let balance = await web3.eth.getBalance(user)
				await decentralizedBank.borrow({value: value, from: user})
				await decentralizedBank.payOff({from: user}).should.be.rejectedWith(EVM_REVERT)

			})
		})
	})
})

