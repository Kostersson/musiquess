express = require 'express'
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)
path = require('path')

# load static files
app.use '/static', express.static '../node_modules'
app.use '/app', express.static '../app'
app.use '/pages', express.static '../html/pages'

app.get('/', (req, res) ->
    res.sendFile '/html/server.html', {'root': '../'}
)

io.on('connection', (socket) ->
    socket.on('chat message', (msg) ->
        io.emit('chat message', msg)
    )
    socket.on('disconnect', () ->
        console.log('user disconnected')
    )
)

http.listen(3000, () ->
    console.log('listening on *:3000')
)