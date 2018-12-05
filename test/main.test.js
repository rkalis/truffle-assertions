const { assert, AssertionError } = require('chai');
const truffleAssert = require('..');

const loseResult = require('./fixture/loseResult.json');
const winResult = require('./fixture/winResult.json');

describe('truffleAssert', () => {
  describe('eventEmitted', () => {
    it('should fail when event with is not emitted', () => {
      assert.throws(() => truffleAssert.eventEmitted(loseResult, 'Payout'), AssertionError);
    });

    it('should return passed error message when event is not emitted', () => {
      assert.throws(() => truffleAssert.eventEmitted(loseResult, 'Payout', null, 'Should pay'), /Should pay/);
    });

    it('should fail when event is emitted with incorrect arguments', () => {
      assert.throws(() => (
        truffleAssert.eventEmitted(loseResult, 'Play', ev => ev.betNumber === ev.winningNumber)
      ), AssertionError);
    });

    it('should return passed error message when event is emitted with incorrect arguments', () => {
      assert.throws(() => (
        truffleAssert.eventEmitted(loseResult, 'Play', ev => ev.betNumber === ev.winningNumber, 'Should win')
      ), /Should win/);
    });

    it('should pass when event is emitted', () => {
      truffleAssert.eventEmitted(winResult, 'Payout');
    });

    it('should pass when event is emitted with correct arguments', () => {
      truffleAssert.eventEmitted(winResult, 'Play', ev => ev.betNumber === ev.winningNumber);
    });
  });

  describe('eventNotEmitted', () => {
  });
  describe('prettyPrintEmittedEvents', () => {
  });
  describe('createTransactionResult', () => {
  });
  describe('fails', () => {
  });
  describe('reverts', () => {
  });
});
