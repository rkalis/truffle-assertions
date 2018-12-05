const { assert, AssertionError } = require('chai');
const truffleAssert = require('..');

const loseResult = require('./fixture/loseResult.json');
const winResult = require('./fixture/winResult.json');

describe('truffleAssert', () => {
  describe('eventEmitted', () => {
    it('should fail when event is not emitted', () => {
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
    it('should fail when event is emitted', () => {
      assert.throws(() => truffleAssert.eventNotEmitted(loseResult, 'Play'), AssertionError);
    });

    it('should return passed error message when event is emitted', () => {
      assert.throws(() => truffleAssert.eventNotEmitted(loseResult, 'Play', null, 'Should not play'), /Should not play/);
    });

    it('should fail when event with specified arguments is emitted', () => {
      assert.throws(() => (
        truffleAssert.eventNotEmitted(winResult, 'Play', ev => ev.betNumber === ev.winningNumber)
      ), AssertionError);
    });

    it('should return passed error message when event with specified arguments is emitted', () => {
      assert.throws(() => (
        truffleAssert.eventNotEmitted(winResult, 'Play', ev => ev.betNumber === ev.winningNumber, 'Should not win')
      ), /Should not win/);
    });

    it('should pass when event is not emitted', () => {
      truffleAssert.eventNotEmitted(loseResult, 'Payout');
    });

    it('should pass when event with specified arguments is not emitted', () => {
      truffleAssert.eventNotEmitted(winResult, 'Play', ev => ev.betNumber !== ev.winningNumber);
    });
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
