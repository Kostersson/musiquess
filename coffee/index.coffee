express = require 'express'
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)
path = require 'path'
User = require './user'

users = []

# load static files
app.use '/static', express.static '../node_modules'
app.use '/app', express.static '../app'
app.use '/pages', express.static '../html/pages'

app.get('/', (req, res) ->
    res.sendFile '/html/client.html', {'root': '../'}
)
app.get('/server/', (req, res) ->
  res.sendFile '/html/server.html', {'root': '../'}
)

io.on('connection', (socket) ->
    console.log User
    socket.on('connectUser', (result) ->
      u = new User 1, result.name, result.image, 100
      users.push u
      io.emit('addUser', u)
    )
    socket.on('disconnect', () ->
        console.log('user disconnected')
    )
)

http.listen(3000, () ->
    console.log('listening on *:3000')
)