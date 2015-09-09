class User
  constructor: (@id, @name, @image, @points) ->


  addPoints: (pointsToAdd) ->
    @points += pointsToAdd

module.exports = User