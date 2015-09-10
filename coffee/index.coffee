express = require 'express'
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)
path = require 'path'
mongoose = require 'mongoose'
fs = require 'fs'

app.set('port', process.env.PORT || 3000);

# load static files
app.use '/static', express.static '../node_modules'
app.use '/app', express.static '../app'
app.use '/pages', express.static '../html/pages'
app.use '/music', express.static '../music'

app.get('/', (req, res) ->
    res.sendFile '/html/client.html', {'root': '../'}
)
app.get('/server/', (req, res) ->
  res.sendFile '/html/server.html', {'root': '../'}
)

http.listen(app.get('port'), ->
    console.log('listening on *:' + app.get('port'))
)

mongoose.connect('mongodb://localhost/musiquess')
db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

userSocket = require('./controllers/user-controller')(io)
music = require('./controllers/music-controller')(io)
