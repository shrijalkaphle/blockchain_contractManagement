var User = artifacts.require("./User.sol");

contract("User", function(accounts){
    it("two user", function() {
        return User.deployed().then(function(instance) {
            return instance.userCount();
        }).then(function(count) {
            assert.equal(count,2);
        });
    });
});