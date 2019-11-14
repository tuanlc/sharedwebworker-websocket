var ws = new WebSocket("http://localhost:8001");
var broadcastChannel = new BroadcastChannel("WebSocketChannel");

var mappingIdToPort = {};

ws.onopen = function() {
  broadcastChannel.postMessage({ type: "WSState", state: ws.readyState })
};
ws.onclose = function() {
  broadcastChannel.postMessage({ type: "WSState", state: ws.readyState })
};

ws.onmessage = function(data) {
  console.log("Received message from server: " + data);

  const parsedData = { data: JSON.parse(data), type: "message" }

  if (!parsedData.data.id) {
    broadcastChannel.postMessage(parsedData);
  } else {
    idToPortMap[parsedData.data.id].postMessage(parsedData);
  }
};

onconnect = function(event) {
  var port  =  event.ports[0];

  port.onmessage = function(message) {
    idToPortMap[message.data.from] = port;
    
    ws.send(JSON.stringify({ data: message.data }));
  };

  port.postMessage({ state: ws.readyState, type: "WSState"});
};


