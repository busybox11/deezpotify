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

let clientsHandler = require('./clients')

let clients = {}

function getCookie(cookiestr, name) {
	const value = `; ${cookiestr}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

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
			res.cookie('platform', 'spotify')

			res.redirect('/app')
		})
	}
})

io.on('connection', (socket) => {
	let id = socket.id
	let cookie = socket.handshake.headers.cookie
	let platform = getCookie(cookie, 'platform')
	let client

	console.log(`New client ${id}`)

	let wsClients = {}
	Object.keys(clients).forEach(function(key) {
		wsClients[key] = {
			profilePic: clients[key].user.images[0].url,
			name: clients[key].user.display_name,
			user_id: clients[key].user.id
		}
		console.log(wsClients[key])
	});
	io.emit('clients', JSON.stringify({type: 'newClient', id: socket.id, clients: wsClients}))

	if (platform == "spotify") {
		clients[id] = {
			token: getCookie(cookie, 'token'),
			refresh: getCookie(cookie, 'refresh'),
			time: getCookie(cookie, 'time'),
			platform: platform
		}

		var credentials = {
			token: getCookie(cookie, 'token'),
			refresh: getCookie(cookie, 'refresh')
		}
		clientsHandler.login(platform, credentials).then( function(client) {
			client.getMe()
			.then(function(data) {
				clients[id]['user'] = data.body
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		})
	}

	socket.on('disconnect', (reason) => {
		console.log(`Client ${id} disconnected`)
		delete clients[id]
		console.log(clients)
	})
})

app.listen(httpPort, function () {
	console.log(`Listening on port ${httpPort}!`)
})

server.listen(httpsPort, function () {
	console.log(`Listening on port ${httpsPort}!`)
})