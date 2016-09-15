const http = require('http')
const execFile = require('child_process').execFile
const fs = require('fs')
const path = require('path')
const async = require('async')
const uuid = require('uuid').v1
const temp = process.env.temp

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    return res.end('OK')
  }
  var data = ''
  req.on('data', function (chunk) {
    data += chunk.toString()
  })

  req.on('end', function () {
    console.log(data)
    const opts = JSON.parse(data)

    const id = uuid()

    const childArgs = [
      '-fo',
      path.join(temp, `${id}.fo`),
      '-pdf',
      path.join(temp, `${id}.pdf`)
    ]

    const isWin = /^win/.test(process.platform)
    const fopFile = 'fop' + (isWin ? '.bat' : '')

    async.waterfall([
      (cb) => fs.writeFile(path.join(temp, `${id}.fo`), opts.fo, cb),
      (cb) => execFile(fopFile, childArgs, cb),
      (stdout, stderr, cb) => fs.stat(path.join(temp, `${id}.pdf`), (err) => cb(err, stdout, stderr))
    ], (err, stdout, stderr) => {
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        return res.end('Error when executing fop ' + stdout + stderr + err.stack)
      }

      const stream = fs.createReadStream(path.join(temp, `${id}.pdf`))
      stream.pipe(res)
    })
  })
})

server.listen(6000)
