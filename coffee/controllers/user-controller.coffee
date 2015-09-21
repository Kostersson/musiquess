mongoose = require 'mongoose'
User = require './../models/user-model'

module.exports = (io) ->
  users = {}
  guesses = {};
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

    socket.on('guess', (guess) ->
      guesses[socket.id] = guess
      guesses[socket.id].time = new Date().getTime()
      if Object.keys(guesses).length >= Object.keys(users).length
        calculatePoints()
    )
  )

  calculatePoints = ->
    best = {}
    for key, value of guesses
      if best isnt {} and value.rightChoise is true
        best = value
        best.socketId = key
      else if value.rightChoise is true and best.time > value.time
        best = value
        best.socketId = key

    if best isnt {}
      console.log("foooooooooo")
      console.log(best)
      users[best.socketId].addPoints(1)
      users[best.socketId].save()
    sendRoundWinner(best)

  sendRoundWinner = (winner) ->
    console.log(winner)
    io.emit('users', users)
    io.emit('round-winner', winner)

  sendUsers = ->
    io.emit('users', users)