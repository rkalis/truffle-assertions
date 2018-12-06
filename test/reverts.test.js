const { assert } = require('chai');
const truffleAssert = require('..');

describe('reverts', () => {
  it('should initialise', () => {
    assert.isDefined(truffleAssert);
  });
});
