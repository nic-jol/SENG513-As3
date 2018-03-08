//Express initializes app to be a function handler that you can supply to an HTTP server
var app = require('express')();    
var http = require('http').Server(app);

// pass HTTP server to initialize a new instance of socket.io
var io = require('socket.io')(http);

// People object
var people = {};

//define a route handler / that gets called when we hit our website home
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// TODO: change so displayed in chat room
// Listen on the connection event for incoming sockets and I log it to the console

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

//make the http server listen on port 3000
http.listen(3000, function(){
    console.log('listening on *:3000');
});