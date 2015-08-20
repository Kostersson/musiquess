var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/**
 * load static files
 */
app.use('/static', express.static('node_modules'));
app.use('/app', express.static('app'));
app.use('/pages', express.static('pages'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/server.html');
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});