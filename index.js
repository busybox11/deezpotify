const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')

let spotifyModule = require('./spotify')

const httpPort = 80
const httpsPort = 44100
const key = fs.readFileSync('./certs/localhost.key')
const cert = fs.readFileSync('./certs/localhost.crt')

const app = express()
const server = https.createServer({key: key, cert: cert }, app)
const io = require('socket.io')(server)

app.use((req, res, next) => {
	if (!req.secure) {
		return res.redirect('https://' + req.headers.host + req.url)
	}
	next()
})

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'views/index.html'))
})

app.get('/app', function(req, res) {
	res.sendFile(path.join(__dirname, 'views/app.html'))
})

app.get('/auth/spotify', function(req, res) {
	if (req.param('code') == undefined) {
		res.redirect(spotifyModule.getLoginURL())
	} else {
		spotifyModule.getTokens(req.param('code')).then(function(data) {
			res.cookie('refresh', data.refresh)
			res.cookie('token', data.token)
			res.cookie('time', Date.now() + data.expires)

			res.redirect('/app')
		})
	}
})

io.on('connection', (socket) =>{
	console.log(`Connected to client ${socket.id}`)
	io.emit('clients', JSON.stringify({type: "newClient"}))
})

socket.on("disconnect", (reason) => {
	console.log('Client disconnected')
});

app.listen(httpPort, function () {
	console.log(`Listening on port ${httpPort}!`)
})

server.listen(httpsPort, function () {
	console.log(`Listening on port ${httpsPort}!`)
})