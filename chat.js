// we have to have nodejs installed and socket.io 
// module, more info on installing this here: http://socket.io/

// we create an object which will communicate between clients
var io = require('socket.io').listen(4001);

// sockets - our current connected clients
var sockets = {};
// messages - what clients sent here
var messages = [];
// an additional parameter to show usage of websockets
var connectedUsers = 0;

// this below is what will happen when someone connects to our 
// server
io.sockets.on('connection', function (socket) {
    // first we add this client to our hash
    sockets[socket.id] = socket;
    // and increment how many users are currently 'online'
    connectedUsers++;

    // for every socket we emit event named 'usersCount' 
    // (which is processed by client) with current online counter
    for (var v in sockets) {
        sockets[v].emit('usersCount', connectedUsers);
    }

    // this below - what we're doing if clinet disconnects from server
    // (for example will close browser window)
    socket.on('disconnect', function() {
        // we're decreasing current online counter 
        connectedUsers--;
        // removing this client from our connected users hash
        delete sockets[socket.id]
        // and emit event usersCount to those who left online
        for (var v in sockets) {
            sockets[v].emit('usersCount', connectedUsers);
        }
    });
    
    // when user connects it wants to receive current messages
    // that has been already send by other users. for this
    // operation we need to tell server that client will emit
    // to server event named 'getMessages' and we need to 
    // process it, by sending reply to client with 
    // 'receiveMessages' event with our messages array
    socket.on('getMessages', function() {
        socket.emit('receiveMessages', messages);
    });

    // finally we need to declare what will happen
    // if client will send to us a message
    socket.on('msg', function(message) {
        // we're adding this message to our message array
        messages.push(message);
        // and emit 'receiveMessage' to all connected users
        for (var v in sockets) {
            sockets[v].emit('receiveMessage', message);
        }
    });
});
// everything else is being processed by client (see client.html)