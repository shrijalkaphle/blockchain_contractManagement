App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,


  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      ethereum.enable();
      web3 = new Web3(web3.currentProvider);

    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("SCon.json", function(scon) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.SCon = TruffleContract(scon);
      // Connect provider to interact with contract
      App.contracts.SCon.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.initContract2();
    });
  },

  initContract2: function() {

    $.getJSON("User.json", function(user) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.User = TruffleContract(user);
      // Connect provider to interact with contract
      App.contracts.User.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });

  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.SCon.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.contractEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var sconInstance;
    var userInstance;
    var loader = $("#loader");
    var content = $("#content");
    var acc;
    var user;

    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        acc = account;

      }
    });

    App.contracts.User.deployed().then(function(inst) {
      userInstance = inst;
      return userInstance.userCount();
    }).then(function(userCount) {
      var userName = $('#userName');
      userName.empty();

      var sconOwner = $('#sconOwner');
      sconOwner.empty();

      var startDate = $('#startDate');
      startDate.empty();

      var adminView = $('#adminView');
      adminView.empty();

      for(var i = 0;i <= userCount; i++) {
        userInstance.users(i).then(function(usr){
          var name = usr[1];
          var wallet = usr[2];
          var role = usr[3];
          var lcase = wallet.toLowerCase();
          
          if(acc == lcase) {
            loader.hide();
            content.show();

            if (role == 'admin') {
              var adminTemplate = "<li><a href='addUser.html'>Add User</a></li>" + "<li><a href='viewUser.html'>View User</a></li>"
              adminView.append(adminTemplate);
            }
            user = name;

            var userTemplate = user
            userName.append(userTemplate);

            var ownerTemplate = "<input type='text' class='form-control' id='owner' value='"+ name +"' name='owner' disabled>";
            sconOwner.append(ownerTemplate);

            var date = new Date();
            var dd = String(date.getDate());
            var mm = String(date.getMonth()+1);
            var yyyy = date.getFullYear();
            date = yyyy +"/"+ mm +"/"+ dd;

            var dateTemplate = "<input type='text' class='form-control' id='owner' value='"+ date +"' name='owner' disabled>";
            startDate.append(dateTemplate);
          }

        })
      }
    })


    // Load contract data
    App.contracts.SCon.deployed().then(function(instance) {
      sconInstance = instance;
      return sconInstance.sconCount();
    }).then(function(sconCount) {
      var sconResults = $("#sconResults");
      sconResults.empty();

      var conToAccept = $('#conToAccept');
      conToAccept.empty();

      var otherContract = $('#otherContract');
      otherContract.empty();

      for (var i = 1; i <= sconCount; i++) {
        sconInstance.scons(i).then(function(scon) {
          var id = scon[0];
          var title = scon[1];
          var owner = scon[2];
          var client = scon[3];
          var desc = scon[4];
          var date = scon[5];
          var val = scon[6];
          var status = scon[7];

          var str1 = hex_to_ascii(title);
          var str2 = hex_to_ascii(owner);
          var str3 = hex_to_ascii(client);
          var str4 = hex_to_ascii(desc);
          var str5 = hex_to_ascii(date);
          var str6 = hex_to_ascii(val);
          var str7 = hex_to_ascii(status);
          
          var contractDate = new Date();
          var dd = String(contractDate.getDate());
          var mm = String(contractDate.getMonth()+1);
          var yyyy = contractDate.getFullYear();
          contractDate = yyyy + mm + dd;
          contractDate = parseInt(contractDate);
          contractDate = parseInt(contractDate);

          if(date < contractDate) {
            App.contracts.SCon.deployed().then(function(instance) {
              sconInstance = instance;
              return sconInstance.checkStatus(contractDate);
            })
          }

          // Render contract created
          if(!str2.localeCompare(user)) {
            var edit = "<form onSubmit  = 'App.deleteSCon("+id+"); return false;'>"
            var edit = edit + "<button type='submit' class='btn btn-default'> <span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button>"
            var edit = edit + "</form>"

            var sconTemplate = "<tr><th>" + id + "</th><td>"+ str1 + "</td><td>" + str2 + "</td><td>" + str3 + "</td><td>" + str4 + "</td><td>" + str7 + "</td><td>" + str6 + "</td><td>" + str5 + "</td><td>"+edit+"</td></tr>"
            sconResults.append(sconTemplate);
          }

          var stat = 'Pending';

          if(!str3.localeCompare(user) ) {
            if(!str7.localeCompare(stat)) {
              var accpt = "<form onSubmit  = 'App.acceptSCon("+id+"); return false;'>"
              var accpt = accpt + "<button type='submit' class='btn btn-default'> <span class='glyphicon glyphicon-ok' aria-hidden='true'></span></button>"
              var accpt = accpt + "</form>"

              var rej = "<form onSubmit  = 'App.rejectSCon("+id+"); return false;'>"
              var rej = rej + "<button type='submit' id='reject"+id+"' class='btn btn-default'> <span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button>"
              var rej = rej + "</form>"
            
              var conTemplate = "<tr><th>" + id + "</th><td>"+ str1 + "</td><td>" + str2 + "</td><td>" + str3 + "</td><td>" + str4 + "</td><td>" + str7 + "</td><td>" + str6 + "</td><td>" + str5 + "</td>"
              conTemplate = conTemplate + "<td><div id='accept'>"+ accpt + "</div></td><td><div id='reject1'>"+ rej +"</div></td></tr>"
              conToAccept.append(conTemplate);
            } else {
              //alert('here')
              var otherTemplate = "<tr><th>" + id + "</th><td>"+ str1 + "</td><td>" + str2 + "</td><td>" + str3 + "</td><td>" + str4 + "</td><td>" + str7 + "</td><td>" + str6 + "</td><td>" + str5 + "</td></tr>"
              otherContract.append(otherTemplate);
            }
            
          }
        });
      }
    }).catch(function(error) {
      console.warn(error);
    })

    App.contracts.User.deployed().then(function(instance){
      userInstance = instance;
      return userInstance.userCount();
    }).then(function(userCount){
      var userList = $("#userList");
      userList.empty();

      for (var i = 1; i <= userCount; i++) {
        userInstance.users(i).then(function(usr) {
          var id = usr[0];
          var name = usr[1];
          var wallet = usr[2];
          var role = usr[3];

          //render
          var Template = "<tr><th>" + id + "</th><td>"+ name + "</td><td>" + wallet + "</td><td>" + role + "</td></tr>"
          userList.append(Template);
        })
      }

    })

  },

  createUser: function() {
    var name = $('#name').val();
    var wallet = $('#wallet').val().toLowerCase();
    var role = $('#role').val();

    App.contracts.User.deployed().then(function(instance) {
      return instance.createUser(name,wallet,role);
    }).catch(function(err) {
      console.error(err);
    })
    document.getElementById("userForm").reset();
  },

  deleteSCon: function(addr) {
    //var addr = $('#removeID').val();
    //alert(addr);
    App.contracts.SCon.deployed().then(function(instance) {
      return instance.remove(addr);
    }).catch(function(err) {
      console.error(err);
    })
    location.reload();
  },

  rejectSCon: function(addr) {
    //var addr = $('#rejID').val();
    //alert(addr);
    App.contracts.SCon.deployed().then(function(instance) {
      return instance.reject(addr);
    }).catch(function(err) {
      console.error(err);
    })
    location.reload();
  },

  acceptSCon: function(addr) {
    //var addr = $('#accptID').val();
    //alert(addr);
    App.contracts.SCon.deployed().then(function(instance) {
      return instance.accept(addr);
    }).catch(function(err) {
      console.error(err);
    })
    location.reload();
  },

  createSCon: function() {

    var userInstance;
    var flag = 0;

    var title = $('#title').val();
    var owner = $('#owner').val();
    var client = $('#client').val();
    var desc = $('#desc').val();
    var period = $('#period').val();
    var add = parseInt(period) + 1
    var val = $('#value').val();

    var endDate = new Date();
    var dd = String(endDate.getDate());
    var mm = String(endDate.getMonth()+add);
    var yyyy = endDate.getFullYear();
    endDate = yyyy + "/" + mm + "/" + dd;
    endDate = endDate.toString();

    var array = [title,owner,client,desc,endDate,val];
    //alert(endDate);
    App.contracts.User.deployed().then(function(instance) {
      userInstance = instance;
      return userInstance.userCount();
    }).then(function(userCount) {
      for(var i = 1;i <= userCount; i++) {
        userInstance.users(i).then(function(usr){
          var name = usr[1];
          if(client == name) {
            flag = 0;
          } else {
            flag = 1;
          }
        })
      }
      if (flag != 0) {
        alert('no such user');
      } else {
        App.contracts.SCon.deployed().then(function(instance) {
         // return instance.createStruct(array);
        }).catch(function(err) {
          console.error(err);
        })
      }
    })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

function hex_to_ascii(str1) {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}