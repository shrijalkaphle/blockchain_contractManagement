pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract SCon {
    struct scon {
        uint id;
        string title;
        string owner;
        string client;
        string description;
        string period;
        string contractValue;
        string status;
        string date;
    }

    struct inserting {
        string title;
        string owner;
        string client;
        string description;
        string period;
        string contractValue;
        string status;
        string date;
    }

    mapping(uint=>scon) public scons;

    uint public sconCount;

    event votedEvent (
        uint indexed _candidateId
    );

    function createSCon (inserting memory contracts) private {
        sconCount++;
        string memory title = contracts.title;
        string memory owner = contracts.owner;
        string memory client = contracts.client;
        string memory desc = contracts.description;
        string memory period = contracts.period;
        string memory value = contracts.contractValue;
        string memory status = contracts.status;
        string memory date = '';

        scons[sconCount] = scon(sconCount, title, owner, client, desc, period, value, status,date);
    }

    function createStruct
    (string[] memory array) public {
        inserting memory con;

        con.title = array[0];
        con.owner = array[1];
        con.client = array[2];
        con.period = array[3];
        con.contractValue = array[4];
        con.description = array[5];
        con.date = array[6];
        con.status = 'pending';

        createSCon(con);
    }

    constructor() public {
        inserting memory con;
        inserting memory con2;

        con.title = '1';
        con.owner = 'Shrijal Kaphle';
        con.client = '1';
        con.period = 1;
        con.contractValue = 1;
        con.description = '1';
        con.status = 'pending';

        con2.title = '1';
        con2.client = 'Shrijal Kaphle';
        con2.owner = '1';
        con2.period = 1;
        con2.contractValue = 1;
        con2.description = '1';
        con2.status = 'pending';

        createSCon(con);
        createSCon(con2);
    }

    function remove(uint addr) public {
        delete(scons[addr]);
    }

    function reject(uint addr) public {
        scons[addr].status = 'Rejected';
    }

    function accept(uint addr) public {
        scons[addr].status = 'Ongoing';
    }

    function checkStatus(string memory date) public {
        for(uint i = 1;i <= sconCount; i++) {
            scons[i].date = date;
        }
    }
}