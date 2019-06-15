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
      instance.votedEvent({}, {
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

      for (var i = 1; i <= sconCount; i++) {
        sconInstance.scons(i).then(function(scon) {
          var id = scon[0];
          var title = scon[1];
          var owner = scon[2];
          var client = scon[3];
          var desc = scon[4];
          var period = scon[5];
          var val = scon[6];
          var status = scon[7];
          // var edit = "<form onSubmit  = 'App.deleteSCon(); return false;'>"
          // var edit  = edit + "<input type='text' id='title' value='1' name='title' hidden>"
          // var edit = edit + "<button type='submit' class='btn btn-default'> <span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button>"
          // var edit = edit + "</form>"

          // Render contract created
          if(owner == user) {
            var edit = "<form onSubmit  = 'App.deleteSCon(); return false;'>"
            var edit  = edit + "<input type='text' id='title' value='1' name='title' hidden>"
            var edit = edit + "<button type='submit' class='btn btn-default'> <span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button>"
            var edit = edit + "</form>"

            var sconTemplate = "<tr><th>" + id + "</th><td>"+ title + "</td><td>" + owner + "</td><td>" + client + "</td><td>" + desc + "</td><td>" + status + "</td><td>" + val + "</td><td>" + period + "</td><td>"+edit+"</td></tr>"
            sconResults.append(sconTemplate);
          }

          if(client == user) {
            var accpt = "<form class='form-inline' onSubmit  = 'App.acceptSCon(); return false;'>"
            var accpt  = accpt + "<input type='text' id='title' value='1' name='title' hidden>"
            var accpt = accpt + "<button type='submit' class='btn btn-default'> <span class='glyphicon glyphicon-ok' aria-hidden='true'></span></button>"
            var accpt = accpt + "</form>"
            var rej = "<form class='form-inline' onSubmit  = 'App.rejectSCon(); return false;'>"
            var rej  = rej + "<input type='text' id='title' value='1' name='title' hidden>"
            var rej = rej + "<button type='submit' class='btn btn-default'> <span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button>"
            var rej = rej + "</form>"

            var conTemplate = "<tr><th>" + id + "</th><td>"+ title + "</td><td>" + owner + "</td><td>" + client + "</td><td>" + desc + "</td><td>" + status + "</td><td>" + val + "</td><td>" + period + "</td><td>"+ accpt + "</td><td>"+ rej +"</td></tr>"
            conToAccept.append(conTemplate);
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

  deleteSCon: function() {
    var addr = $('#title').val();
    
    App.contracts.SCon.deployed().then(function(instance) {
      return instance.remove(addr);
      //return instance.createSCon(array);
    }).catch(function(err) {
      console.error(err);
    })
  },

  rejectSCon: function() {
    var addr = $('#title').val();
    
    App.contracts.SCon.deployed().then(function(instance) {
      return instance.reject(addr);
      //return instance.createSCon(array);
    }).catch(function(err) {
      console.error(err);
    })
  },

  acceptSCon: function() {
    var addr = $('#title').val();
    
    App.contracts.SCon.deployed().then(function(instance) {
      return instance.accept(addr);
      //return instance.createSCon(array);
    }).catch(function(err) {
      console.error(err);
    })
  },

  createSCon: function() {

    var userInstance;
    var flag = 0;

    var title = $('#title').val();
    var owner = $('#owner').val();
    var client = $('#client').val();
    var desc = $('#desc').val();
    var period = $('#period').val();
    var add = parseInt(period) + 1;
    var val = $('#value').val();

    var today = new Date();
    var dd = String(today.getDate());
    var mm = String(today.getMonth()+add);
    var yyyy = today.getFullYear();

    today = yyyy + mm + dd;

    App.contracts.User.deployed().then(function(instance) {
      userInstance = instance;
      return userInstance.userCount();
    }).then(function(userCount) {
      for(var i = 1;i <= userCount; i++) {
        userInstance.users(i).then(function(usr){
          var name = usr[1];
          //alert(client);
          if(client == name) {
            flag = 0;
          } else {
            flag = 1;
          }
        })
      }
      if (flag == 1) {
        alert('no such user');
        location.replace('index.html');
      } else {
        App.contracts.SCon.deployed().then(function(instance) {
          return instance.createStruct(title,client,desc,period,val);
          //return instance.createSCon(array);
        }).catch(function(err) {
          console.error(err);
        })
      }

    })
    
    // App.contracts.SCon.deployed().then(function(instance) {
    //   return instance.createStruct(title,client,desc,period,val);
    //   //return instance.createSCon(array);
    // }).catch(function(err) {
    //   console.error(err);
    // })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
