module.exports = (io, os, port) ->
  interfaces = os.networkInterfaces()
  address = ""
  for k1,arr of interfaces
    for obj in arr
      if obj.family is 'IPv4' and not obj.internal
        address = obj.address + ":" + port

  emitAddress = ->
    io.emit('server-address',address)

  io.on('connection', (socket) ->
    socket.on('getAddress', ->
      emitAddress()
    )
  )