const { assert, AssertionError } = require('chai');
const { stub } = require('sinon');
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

// TODO: Truffle v5 -> don't print { 0: xxx, 1: xxx }
describe('prettyPrintEmittedEvents', () => {
  it('should print all emitted events', () => {
    const logStub = stub(console, 'log');

    truffleAssert.prettyPrintEmittedEvents(truffleV4winResult);

    assert(logStub.calledWithMatch('Play'));
    assert(logStub.calledWithMatch('Payout'));
    assert(logStub.calledWithMatch(truffleV4winResult.tx));
    assert(logStub.neverCalledWithMatch('No events'));

    logStub.restore();
  });

  it('should print no events when no events were emitted', () => {
    const logStub = stub(console, 'log');

    truffleV4winResult.logs = [];
    truffleAssert.prettyPrintEmittedEvents(truffleV4winResult);

    assert(logStub.neverCalledWithMatch('Play'));
    assert(logStub.neverCalledWithMatch('Payout'));
    assert(logStub.calledWithMatch(truffleV4winResult.tx));
    assert(logStub.calledWithMatch('No events'));

    logStub.restore();
  });
});
