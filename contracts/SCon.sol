pragma solidity ^0.5.0;
//pragma experimental ABIEncoderV2;

contract SCon {
    struct scon {
        uint id;
        bytes32 title;
        bytes32 owner;
        bytes32 client;
        bytes32 description;
        bytes32 endDate;
        bytes32 contractValue;
        bytes32 status;
    }

    struct inserting {
        bytes32 title;
        bytes32 owner;
        bytes32 client;
        bytes32 description;
        bytes32 endDate;
        bytes32 contractValue;
        bytes32 status;
    }

    mapping(uint=>inserting) public insert;

    mapping(uint=>scon) public scons;

    uint public sconCount;
    uint public insertCount;

    event contractEvent (
        uint indexed _contractID
    );

    function createSCon (inserting memory contracts) private {
        sconCount++;
        bytes32 title = contracts.title;
        bytes32 owner = contracts.owner;
        bytes32 client = contracts.client;
        bytes32 desc = contracts.description;
        bytes32 endDate = contracts.endDate;
        bytes32 value = contracts.contractValue;
        bytes32 status = contracts.status;
        //uint date = contracts.date;

        scons[sconCount] = scon(sconCount, title, owner, client, desc, endDate, value, status);
    }

    function createStruct (bytes32[] memory value) public {
        inserting memory con;
        con.title = value[0];
        con.owner = value[1];
        con.client = value[2];
        con.description = value[3];
        con.endDate = value[4];
        con.contractValue = value[5];
        con.status = bytes32('Pending');

        createSCon(con);
    }

    constructor() public {
        inserting memory con;

        con.title = bytes32('Sample');
        con.owner = bytes32('Shrijal Kaphle');
        con.client = bytes32('User121');
        con.endDate = bytes32('2020/1/1');
        con.contractValue = bytes32('Rs. 70000');
        con.description = bytes32('This is Sample Contract');
        con.status = bytes32('Pending');

        createSCon(con);
    }

    function remove(uint addr) public {
        delete(scons[addr]);
    }

    function reject(uint _contractID) public {
        scons[_contractID].status = bytes32('Rejected');
        //emit contractEvent(_contractID);
    }

    function accept(uint _contractID) public {
        scons[_contractID].status = bytes32('Ongoing');
        //emit contractEvent(_contractID);
    }

    // function checkStatus(uint today) public {
    //     for(uint i = 1;i <= sconCount; i++) {
    //         uint date = scons[i].endDate;
    //         if (date > today) {
    //             scons[i].status = 'Terminated';
    //         }
    //     }
    // }
}