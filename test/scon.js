var SCon = artifacts.require("./SCon.sol");

contract("Scon", function(accounts){
    it("two contract", function() {
        return SCon.deployed().then(function(instance) {
            return instance.sconCount();
        }).then(function(count) {
            assert.equal(count,2);
        });
    });
});