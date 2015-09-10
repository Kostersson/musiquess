mongoose = require 'mongoose'
User = require './../models/user-model'

module.exports = (io) ->
  users = {}
  io.on('connection', (socket) ->

    socket.on('connectUser', (result) ->
      if users[socket.id] is undefined
        console.log(socket.id)

        User.findOne({id: result.id}, (err, user) ->
          console.log("user: " + user)
          setUser(user)
        )

      setUser = (user) ->
        newUser = {}
        if user is null
          newUser = new User ({
              id: result.id,
              name: result.name,
              image: result.image,
              points: 0
            })
          newUser.save()
        else
          newUser = user
          if newUser.image != result.image
            newUser.updateImage(result.image)
            newUser.save()
        users[socket.id] = newUser
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
    socket.on('addPoints', (points) ->
      users[socket.id].addPoints(points)
      users[socket.id].save()
      sendUsers()
    )
    socket.on('quess', (quess) ->
      console.log(quess)
    )
  )

  sendUsers = ->
    io.emit('users', users)