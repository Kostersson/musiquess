class User
  constructor: (@id, @name, @image, @points) ->

  talk: ->
    console.log "My name is #{@name}"

module.exports = User