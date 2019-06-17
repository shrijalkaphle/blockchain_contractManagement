pragma solidity ^0.5.0;

contract User {
    struct userDetails {
        uint uid;
        string name;
        string wallet;
        string role;
    }

    mapping(uint => userDetails) public users;

    uint public userCount;

    constructor() public {
        createUser('Admin','0xE3b1f7337A59015c3490A3f0358dDAF845F6B226','admin');
        //createUser('Roshan Chapaghain','0x07368489fd892De54cd865668BfDad122E7314b7','user');
    }

    function createUser(string memory name,string memory wallet,string memory role) public {
        userCount++;
        users[userCount] = userDetails(userCount,name,wallet,role);
    }
}