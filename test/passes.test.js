const { assert } = require('chai');
const truffleAssert = require('..');

describe('passes', () => {
  it('should initialise', () => {
    assert.isDefined(truffleAssert);
  });
});
