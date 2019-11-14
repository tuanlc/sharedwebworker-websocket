var worker = new SharedWorker("worker.js");
var id = uuid.v4();

var webSocketState = WebSocket.CONNECTING;
console.log(`Initializing the web worker for user: ${id}`);

worker.port.start();

worker.port.onmessage = event => {
  switch (event.data.type) {
    case "WSState":
      webSocketState = event.data.state;
      break;
    case "message":
      handleMessageFromPort(event.data);
      break;
  }
};

var broadcastChannel = new BroadcastChannel("WebSocketChannel");

broadcastChannel.addEventListener("message", function(event) {
  switch (event.data.type) {
    case "WSState":
      webSocketState  =  event.data.state;
      break;
    case "message":
      handleBroadcast(event.data);
      break;
  }
});

function  handleBroadcast(data) {
  console.log("This message is meant for everyone!");
  console.log(data);
}

function  handleMessageFromPort(data) {
  console.log(`This message is meant only for user with id: ${id}`);
  console.log(data);
}

function  postMessageToWSServer(input) {
  if (webSocketState === WebSocket.CONNECTING) {
    console.log("Still connecting to the server, try again later!");
  } else if (
    webSocketState === WebSocket.CLOSING ||
    webSocketState === WebSocket.CLOSED
  ) {
    console.log("Connection Closed!");
  } else {
    worker.port.postMessage({
      id: id,
      data: input
    });
  }
}

// Sent a message to server after approx 2.5 sec. This will 
// give enough time to web socket connection to be created.
setTimeout(() =>  postMessageToWSServer("Initial message"), 2500);