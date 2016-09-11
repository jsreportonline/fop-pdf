const http = require('http')
const execFile = require('child_process').execFile
const fs = require('fs')
const async = require('async')
const uuid = require('uuid').v1

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
      `${id}.fo`,
      '-pdf',
      `${id}.pdf`
    ]

    const isWin = /^win/.test(process.platform)
    const fopFile = 'fop' + (isWin ? '.bat' : '')

    async.waterfall([
      (cb) => fs.writeFile(`${id}.fo`, opts.fo, cb),
      (cb) => execFile(fopFile, childArgs, cb),
      (stdout, stderr, cb) => fs.stat(`${id}.pdf`, (err) => cb(err, stdout, stderr))
    ], (err, stdout, stderr) => {
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        return res.end('Error when executing fop ' + stdout + stderr + err.stack)
      }

      const stream = fs.createReadStream(`${id}.pdf`)
      stream.pipe(res)
    })
  })
})

server.listen(6000)
