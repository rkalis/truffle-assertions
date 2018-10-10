const Casino = artifacts.require('Casino');
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

contract('Casino', (accounts) => {
    let casino;
    const fundingAccount = accounts[0];
    const bettingAccount = accounts[1];
    const fundingSize = 100;

    // build up and tear down a new Casino contract before each test
    beforeEach(async () => {
        casino = await Casino.new({from: fundingAccount});
        await casino.fund({from: fundingAccount, value: fundingSize});
        assert.equal(await web3.eth.getBalance(casino.address), fundingSize);
    });

    afterEach(async () => {
        await casino.kill({from: fundingAccount});
    });

    it("should not be able to bet more than max bet", async () => {
        // given
        let betSize = fundingSize / 50;
        let betNumber = 1;

        // when, then
        await truffleAssert.reverts(
            casino.bet(betNumber, {from: bettingAccount, value: betSize}),
            "Bet amount can not exceed max bet size"
        );
    });

    it("should not be able to bet without sending ether", async () => {
        let betSize = 0;
        let betNumber = 1;

        // when, then
        await truffleAssert.reverts(
            casino.bet(betNumber, {from: bettingAccount, value: betSize}),
            "A bet should be placed"
        );
    });
});
