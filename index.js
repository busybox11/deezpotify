const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')
const _ = require('lodash')

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

function difference(object, base) {
	function changes(object, base) {
		return _.transform(object, function(result, value, key) {
			if (!_.isEqual(value, base[key])) {
				result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
			}
		});
	}
	return changes(object, base);
}

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

io.on('connection', async (socket) => {
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
	socket.emit('clients', JSON.stringify({type: 'newClient', id: socket.id, clients: wsClients}))

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
		clientsHandler.login(platform, credentials).then(async (client) => {
			let lastState = {}

			async function sendPlayingState() {
				try {
					let playbackState = await client.getMyCurrentPlaybackState()
					socket.emit('playing', JSON.stringify({
						type: 'currentPlaybackState',
						data: playbackState.body
					}))
				} catch(e) { console.log(e) }
			}

			let periodicRefresh = async function() {
				try {
					let playbackState = await client.getMyCurrentPlaybackState()
					diff = difference(playbackState.body, lastState)

					if (diff != {}) {
						socket.emit('playing', JSON.stringify({
							type: 'periodicPlaybackState',
							data: ((diff.item != undefined) ? playbackState.body : diff)
						}))

						lastState = playbackState.body
					}
				} catch(e) { console.log(e) }
			}
			
			setInterval(periodicRefresh, 1000)

			let refreshTokenFunc = async function() {
				try {
					let token = await client.refreshAccessToken()
					client.setAccessToken(token.body['access_token'])
					socket.emit('token', JSON.stringify({
						type: 'refreshedToken',
						token: token.body['access_token']
					}))
				} catch(e) { console.log(e) }
			}
			
			setInterval(refreshTokenFunc, 3540000) // Refresh token every 59 minutes

			socket.on('disconnect', (reason) => {
				console.log(`Client ${id} disconnected`)
				clearInterval(periodicRefresh)
				clearInterval(refreshTokenFunc)
				delete clients[id]
				socket.removeAllListeners()
				socket.disconnect(true)
			})

			try {
				let user = await client.getMe()
				clients[id]['user'] = user.body

				socket.on('playing', async (msg) => {
					data = JSON.parse(msg)
					if (data.type == "currentPlaybackState") {
						sendPlayingState()
					}
				})
			} catch(e) { console.log(e) }
		})
	}
})

app.listen(httpPort, function () {
	console.log(`Listening on port ${httpPort}!`)
})

server.listen(httpsPort, function () {
	console.log(`Listening on port ${httpsPort}!`)
})