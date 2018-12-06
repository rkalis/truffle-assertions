const { assert } = require('chai');
const truffleAssert = require('..');

/* This is here as a placeholder. I don't intend to test this,
 * as I intend to replace the method with one that is more maintainable,
 * testable, and is not dependant on web3
 */
describe('createTransactionResult', () => {
  it('should initialise', () => {
    assert.isDefined(truffleAssert);
  });
});
