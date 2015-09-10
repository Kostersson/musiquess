mongoose = require 'mongoose'

Schema = mongoose.Schema

userSchema = new Schema ({
  id: String,
  name: String,
  image: String,
  points: Number
})

userSchema.methods.addPoints = (points) ->
  this.points += points

userSchema.methods.updateImage = (image) ->
  this.image = image

User = mongoose.model('User', userSchema)

module.exports = User
