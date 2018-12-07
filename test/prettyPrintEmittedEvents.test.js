const { assert } = require('chai');
const { stub } = require('sinon');
const truffleAssert = require('..');

const truffleV4winResult = require('./fixture/truffleV4winResult.json');

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
