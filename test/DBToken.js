import { EVM_REVERT } from './constants'

const DBToken = artifacts.require("./DBToken")
const DecentralizedBank = artifacts.require("./DecentralizedBank")

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract("DBToken", (accounts) => {
	let dbToken, decentralizedBank

	beforeEach(async () => {
		dbToken = await DBToken.new()
		decentralizedBank = await DecentralizedBank.new(dbToken.address)
		await dbToken.passMinterRole(decentralizedBank.address, { from: accounts[0]})
	})

	describe('testing DBToken contract', () => {
		describe('success', () => {
			it('checking total supply...', async () => {
				expect(Number(await dbToken.totalSupply())).to.eq(0)
			})

			it('checking dbToken name...', async() => {
				expect(await dbToken.name()).to.be.eq("Decentralized Bank Token")
			})

			it('checking dbToken symbol...', async() => {
				expect(await dbToken.symbol()).to.be.eq("DBT")
			})

			it('checking dbToken standard...', async() => {
				expect(await dbToken.standard()).to.be.eq("Decentralized Bank Token v1.0")
			})

			it('dBank should have Token minter role', async () => {
				expect(await dbToken.minter()).to.eq(decentralizedBank.address)
			})

		})

		describe('failure', () => {
    	it('passing minter role should be rejected', async () => {
				await dbToken.passMinterRole(accounts[1], {from: accounts[0]}).should.be.rejectedWith(EVM_REVERT)
		   })

		  it('tokens minting should be rejected', async () => {
				await dbToken.mint(accounts[1], '1', {from: accounts[0]}).should.be.rejectedWith(EVM_REVERT) //unauthorized minter
		  })
		})

	})
})
	
