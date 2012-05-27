fs     = require 'fs'
{exec} = require 'child_process'

appFiles  = [
  'utility'
  'application'
  'knots'
  'renderer'
  'shaders'
  'tube'
]

graceful = true
doMinify = true
linux = true

task 'build', 'Build single application file from source files', ->
  appname = 'knotgl'
  appContents = new Array remaining = appFiles.length
  for file, index in appFiles then do (file, index) ->
    fs.readFile "#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err and not graceful
      appContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'knotgl.coffee', appContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --output js --compile knotgl.coffee', (err, stdout, stderr) ->
        throw err if err and not graceful
        console.log stdout + stderr
        fs.unlink 'knotgl.coffee', (err) ->
          throw err if err and not graceful
        console.log 'Amalgam generated.'
        if doMinify
          invoke 'minify'
        else
          exec 'cp js/knotgl.js js/knotgl-min.js'

# Uses Google Closure.  This is nice because it generates warning that coffeescript doesn't.
# eg, it catches suspicious statements that don't have side effects.
task 'minify', 'Minify the resulting application file after build', ->
  e = if linux then '/usr/lib/jvm/java/bin/java' else 'java'
  console.log 'Minifying...'
  exec "#{e} -jar \"./compiler.jar\" --js js/knotgl.js --js_output_file js/knotgl-min.js", (err, stdout, stderr) ->
    throw err if err and not graceful
    console.log stdout + stderr
    console.log 'Done.'

task 'watch', 'Watch prod source files and build changes', ->
  console.log "Watching for changes"

  for file in appFiles then do (file) ->
    watch = if linux then fs.watch else fs.watchFile
    watch "#{file}.coffee", (curr, prev) ->
      if +curr.mtime isnt +prev.mtime
        console.log "Saw change in #{file}.coffee"
        graceful = false
        invoke 'build'
        graceful = true