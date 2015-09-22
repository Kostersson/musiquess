mm = require 'musicmetadata'
fs = require 'fs'
path = require 'path'
async = require 'async'
calls = []

module.exports = (io) ->
  songs = []
  randoms = []
  selectedSongs = []
  validFileExtensions = [".mp3", ".wma"]
  amountOfChoices = 4
  rightChoise = 0
  running = false
  runtimeError = false


  walk = (dir, done) ->
    results = []
    fs.readdir(dir, (err, list) ->
      if err
        return done
      pending = list.length
      if not pending
        return done(null, results)
      list.forEach((file) ->
        file = path.resolve(dir,file)
        fs.stat(file, (err, stat) ->
          if stat and stat.isDirectory()
            process.stdout.write('\n')
            walk(file, (err, res) ->
              results = results.concat(res)
              if not --pending
                done(null, results)
            )
          else
            if validFileExtensions.indexOf(path.extname(file)) != -1
                results.push(file)

            process.stdout.write('.')
            if not --pending
                done(null, results)
        )
      )

    )

  setSongs = (a, results) ->
    process.stdout.write("\n done \n")
    songs = results
    console.log(songs.length + " songs")
    createRandoms()

  process.stdout.write('downloading songs \n')
  walk('./../music', setSongs)

  createRandoms = ->
    randoms = []
    randoms.push(Math.floor(Math.random() * songs.length)) for [1..amountOfChoices]
    console.log('randoms: ' + randoms)
    rightChoise = Math.floor(Math.random() * amountOfChoices)
    getSongsData()
    if runtimeError
      runtimeError = false
      createRandoms()




  getSongsData = ->
    selectedSongs = []
    parser(songs[index]) for index in randoms
    async.parallel(calls, (err, result) ->
      if err
        console.log(err)
        runtimeError = true
      else
        selectedSongs[rightChoise].rightChoise = true
        sendSongs()
    )


  parser = (filename) ->
    calls.push((callback) ->
      mm(fs.createReadStream(filename), (err, metadata) ->
        if (err)
          console.log(err)
          runtimeError = true
        selectedSongs.push({
          title: metadata.title,
          artist: metadata.artist,
          filename: filename
          rightChoise: false
        })
        callback(null, filename)
      )
    )

  sendSongs = ->
    calls = []
    selectedSongs.forEach( (song) ->
      song.filename = song.filename.substring(song.filename.indexOf("/music") + 1)
    )
    running = false
    console.log(selectedSongs)
    io.emit('songs', selectedSongs)

  io.on('connection', (socket) ->
    socket.on('newSongs', ->
      if not running
        running = true
        createRandoms()
      else
        console.log("cancelled")
    )
  )









