const { assert, AssertionError } = require('chai');
const truffleAssert = require('..');

const truffleV4loseResult = require('./fixture/truffleV4loseResult.json');
const truffleV4winResult = require('./fixture/truffleV4winResult.json');

describe('eventNotEmitted', () => {
  it('should fail when event is emitted', () => {
    assert.throws(() => truffleAssert.eventNotEmitted(truffleV4loseResult, 'Play'), AssertionError);
  });

  it('should return passed error message when event is emitted', () => {
    assert.throws(() => truffleAssert.eventNotEmitted(truffleV4loseResult, 'Play', null, 'Should not play'), /Should not play/);
  });

  it('should fail when event with specified arguments is emitted', () => {
    assert.throws(() => (
      truffleAssert.eventNotEmitted(truffleV4winResult, 'Play', ev => ev.betNumber === ev.winningNumber)
    ), AssertionError);
  });

  it('should return passed error message when event with specified arguments is emitted', () => {
    assert.throws(() => (
      truffleAssert.eventNotEmitted(truffleV4winResult, 'Play', ev => ev.betNumber === ev.winningNumber, 'Should not win')
    ), /Should not win/);
  });

  it('should pass when event is not emitted', () => {
    truffleAssert.eventNotEmitted(truffleV4loseResult, 'Payout');
  });

  it('should pass when event with specified arguments is not emitted', () => {
    truffleAssert.eventNotEmitted(truffleV4winResult, 'Play', ev => ev.betNumber !== ev.winningNumber);
  });
});
