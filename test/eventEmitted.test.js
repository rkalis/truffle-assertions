const { assert, AssertionError } = require('chai');
const truffleAssert = require('..');

const truffleV4loseResult = require('./fixture/truffleV4loseResult.json');
const truffleV4winResult = require('./fixture/truffleV4winResult.json');

describe('eventEmitted', () => {
  it('should fail when event is not emitted', () => {
    assert.throws(() => truffleAssert.eventEmitted(truffleV4loseResult, 'Payout'), AssertionError);
  });

  it('should return passed error message when event is not emitted', () => {
    assert.throws(() => truffleAssert.eventEmitted(truffleV4loseResult, 'Payout', null, 'Should pay'), /Should pay/);
  });

  it('should fail when event is emitted with incorrect arguments', () => {
    assert.throws(() => (
      truffleAssert.eventEmitted(truffleV4loseResult, 'Play', ev => ev.betNumber === ev.winningNumber)
    ), AssertionError);
  });

  it('should return passed error message when event is emitted with incorrect arguments', () => {
    assert.throws(() => (
      truffleAssert.eventEmitted(truffleV4loseResult, 'Play', ev => ev.betNumber === ev.winningNumber, 'Should win')
    ), /Should win/);
  });

  it('should pass when event is emitted', () => {
    truffleAssert.eventEmitted(truffleV4winResult, 'Payout');
  });

  it('should pass when event is emitted with correct arguments', () => {
    truffleAssert.eventEmitted(truffleV4winResult, 'Play', ev => ev.betNumber === ev.winningNumber);
  });
});
