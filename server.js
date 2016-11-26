const grpc = require('grpc');
const config = require('./config');

const buildChatProto = () => {
  const PROTO_PATH = __dirname + '/chat.proto';
  return grpc.load(PROTO_PATH).chat;
};

const chatProto = buildChatProto();

// Global variables
var userList = [];
var inbox = {};

//helper
const getUserNameFromReq = (call) => call.request.username;
const getContentFromReq = (call) => call.request.content;

// Implement Endpoint

const login = (call, cb) => {
  const username = getUserNameFromReq(call);
  console.log('new Request...', { username });

  userList.push(username);

  //initialize inbox for new user
  inbox[username] = [];

  cb(null, {success : true, username : username});
};

const sendMessage = (call, cb) => {
  const username = getUserNameFromReq(call);
  const content = getContentFromReq(call);

  const message = `@channel ${username}:${content}`;
  userList.map(
    user => inbox[user].push(message)
  );

  cb(null, { success: true });
};

const getMessages = (call, cb) => {
  const username = getUserNameFromReq(call);

  if (userList.indexOf(username) === -1)  {
    cb(null, { success: false });

  } else {
    if (!(username in inbox)) {
      inbox[username] = [];
    }

    var temp = inbox[username];
    inbox[username] = [];

    cb(null, { messages: temp });
  }
}

function main() {
  var server = new grpc.Server();
  server.addProtoService(chatProto.KoloChat.service, {
    login,
    sendMessage,
    getMessages
  });

  server.bind(
    `${config.server.host}:${config.server.port}`,
    grpc.ServerCredentials.createInsecure()
  );
  server.start();
}

main();