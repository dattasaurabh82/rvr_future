var GPIO = require('onoff').Gpio,
    buttonTraining = new GPIO(4, 'in', 'both');
    buttonOne = new GPIO(17, 'in', 'both');
    buttonTwo = new GPIO(18, 'in', 'both');
    buttonThree = new GPIO(19, 'in', 'both');
    buttonFour = new GPIO(20, 'in', 'both');

var buttonStates = {
                      buttonTraining: "LOW",
                      buttonOne: "LOW",
                      buttonTwo: "LOW",
                      buttonThree: "LOW",
                      buttonFour: "LOW"
                    };

function switchOne(err, state) {
  if(err){
     throw err;
  }else{
    if(state == 1) {
      console.log("pressedOne");
      buttonStates.buttonOne = "HIGH";
      
      broadcast(buttonStates);
      
      console.log(buttonStates);
    }else{
      buttonStates.buttonOne = "LOW";
    }
  }
}

function switchTwo(err, state) {
  if(err){
     throw err;
  }else{
    if(state == 1) {
      console.log("pressedTwo");
      buttonStates.buttonTwo = "HIGH";
      
      broadcast(buttonStates);
      
      console.log(buttonStates);
    }else{
      buttonStates.buttonTwo = "LOW";
    }
  }
}

function switchThree(err, state) {
  if(err){
     throw err;
  }else{
    if(state == 1) {
      console.log("pressedThree");
      buttonStates.buttonThree = "HIGH";
      
      broadcast(buttonStates);
      
      console.log(buttonStates);
    }else{
      buttonStates.buttonThree = "LOW";
    }
  }
}

function switchFour(err, state) {
  if(err){
     throw err;
  }else{
    if(state == 1) {
      console.log("pressedFour");
      buttonStates.buttonFour = "HIGH";
      
      broadcast(buttonStates);
      
      console.log(buttonStates);
    }else{
      buttonStates.buttonFour = "LOW";
    }
  }
}

function switchState(err, state) {
  if(err){
     throw err;
  }else{
    if(state == 1) {
      buttonStates.buttonTraining = "HIGH";
      broadcast(buttonStates);
      console.log("Training Mode");
      // console.log(buttonStates);
    
    }else{
      buttonStates.buttonTraining = "LOW";
      buttonStates
      broadcast(buttonStates);
      console.log("Test Mode");
      // console.log(buttonStates);
    }
  }
}

buttonTraining.watch(switchState);
buttonOne.watch(switchOne);
buttonTwo.watch(switchTwo);
buttonThree.watch(switchThree);
buttonFour.watch(switchFour);

///////////-------------- https server ---------------///////////
var express = require('express');
var fs = require('fs');
var https = require('https');

var app = express();

var privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');

var credentials = {
  key: privateKey,
  cert: certificate
};

var SERVER_PORT = process.env.PORT || 8081;
var HOST = process.env.HOST || '';

//pass in your express app and credentials to create an https server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(SERVER_PORT, HOST, null, function(){
  console.log(" ");
  console.log("----------------------------------");
  console.log('wss server running on port: %d in %s mode', this.address().port, app.settings.env);
  console.log("with self signed ssl sertficate");
  console.log("----------------------------------");
  console.log(" ");
});


///////////-------------- WEB SOCKET PART ---------------////////////

var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({
  server: httpsServer
});

var connections = new Array();

var msgFromServer = "Connection confirmed";
var sendData = false;

// websocket event listener
wss.on('connection', handleConnection);

function handleConnection(client){
  console.log("New Connection");                 // you have a new client

  connections.push(client);                      // add this client to the connections array

  client.on('message', function(data){
    
    var msgFromClient = String(data);            // handshake message
    console.log("client said: " + msgFromClient);

    if (data == "Hello server"){
      sendData = true;
    }else{
      sendData = false;
    }

    if (sendData){
      broadcast(msgFromServer);
      broadcast(buttonStates);
    }

  });

  client.on('close', function() {                // when a client closes its connection
    console.log("connection closed");            // print it out
    var position = connections.indexOf(client);  // get the client's position in the array
    connections.splice(position, 1);             // and delete it from the array
    sendData = false;
  });
}

// This function broadcasts messages to all webSocket clients
function broadcast(data) {
 for (var c in connections) {                     // iterate over the array of connections
    connections[c].send(JSON.stringify(data)); // send the data to each connection
  }
}
