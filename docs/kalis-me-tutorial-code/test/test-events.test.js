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

    it("should lose when bet on the wrong number", async () => {
        // given
        let betSize = 1;
        // we know what the winning number will be since we know the algorithm
        let betNumber = (await web3.eth.getBlock("latest")).number % 10 + 1;

        // when
        let tx = await casino.bet(betNumber, {from: bettingAccount, value: betSize});

        // then
        // player should be the same as the betting account, and the betted number should not equal the winning number
        truffleAssert.eventEmitted(tx, 'Play', (ev) => {
            return ev.player === bettingAccount && !ev.betNumber.eq(ev.winningNumber);
        });
        // there should be no payouts
        truffleAssert.eventNotEmitted(tx, 'Payout');
        // check the contract's balance
        assert.equal(await web3.eth.getBalance(casino.address), fundingSize + betSize);
    });

    it("should win when bet on the right number", async () => {
        // given
        let betSize = 1;
        // we know what the winning number will be since we know the algorithm
        let betNumber = ((await web3.eth.getBlock("latest")).number + 1) % 10 + 1;

        // when
        let tx = await casino.bet(betNumber, {from: bettingAccount, value: betSize});

        // then
        // player should be the same as the betting account, and the betted number should equal the winning number
        truffleAssert.eventEmitted(tx, 'Play', (ev) => {
            return ev.player === bettingAccount && ev.betNumber.eq(ev.winningNumber);
        });
        // player should be the same as the betting account, and the payout should be 10 times the bet size
        truffleAssert.eventEmitted(tx, 'Payout', (ev) => {
            return ev.winner === bettingAccount && ev.payout.toNumber() === 10 * betSize;
        });
        // check the contract's balance
        assert.equal(await web3.eth.getBalance(casino.address), fundingSize + betSize - betSize * 10);
    });
});
