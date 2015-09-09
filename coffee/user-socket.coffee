User = require './user'

module.exports = (io) ->
  users = {}
  io.on('connection', (socket) ->

    socket.on('connectUser', (result) ->
      console.log(socket.id)
      u = new User result.id, result.name, result.image, 0

      users[socket.id] = u
      sendUsers()
    )
    socket.on('removeUser', ->
      delete users[socket.id]
      sendUsers()
      console.log("-------------")
      console.log(socket.id)
      console.log('user removed')
      console.log("-------------")
    )

    socket.on('disconnect', ->
      delete users[socket.id]
      sendUsers()
      console.log("-------------")
      console.log(socket.id)
      console.log('user disconnected')
      console.log("-------------")
    )
    socket.on('getUsers', ->
      sendUsers()
    )
  )

  sendUsers = ->
    io.emit('users', users)