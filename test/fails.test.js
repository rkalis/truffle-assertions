const { assert } = require('chai');
const truffleAssert = require('..');

describe('fails', () => {
  it('should initialise', () => {
    assert.isDefined(truffleAssert);
  });
});
