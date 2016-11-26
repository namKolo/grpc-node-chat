const grpc = require('grpc');

const config = require('./config');

const buildChatProto = () => {
  const PROTO_PATH = __dirname + '/chat.proto';
  return grpc.load(PROTO_PATH).chat;
};

const chatProto = buildChatProto();
const GET_MESSAGES_INTERVAL = 500;
// init
const client = new chatProto.KoloChat(
  `${config.server.host}:${config.server.port}`,
  grpc.credentials.createInsecure()
);

var globalUserName;


//implement


var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function readCommand() {

  const login = (line) => {
    const username = line.substr(7);

    client.login({
      username: username
    }, (err, response) => {
      if (err){
        console.log("Error login in...", err);
      }  else {
        if (response.success == false){
          console.log("Error login in");
        } else {
          console.log("Welcome, " + response.username);
          globalUserName = response.username;
          setTimeout(getMessages, GET_MESSAGES_INTERVAL);
        }
      }
    });
  };

  const sendMessage = (line) => {
    const content = line.substr(6);

    client.sendMessage({
      username: globalUserName,
      content
    }, (err, response) => {
      if (err) {
        console.log("Connection error");
      }  else {
        if (response.success == false){
            console.log("Error sending message");
        } else {
            console.log("Message sent");
        }
      }
    });
  };

  rl.on('line', (line) => {
    if (line.indexOf('/login') == 0) {
      login(line);

    } else if (line.indexOf('/send') === 0) {
      sendMessage(line);
    }
  });
}

readCommand();

//Retreive message every interval from server
function getMessages(){
    client.getMessages({username: globalUserName}, function(err, response){
        if (err){
            console.log("Failed to connect to server");
            process.exit()
        } else {
            for (var i = 0; i < response.messages.length; i++) {
                console.log(response.messages[i]);
            }

            setTimeout(getMessages, GET_MESSAGES_INTERVAL);
        }
    });
}
