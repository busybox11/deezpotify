let SpotifyWebApi = require('spotify-web-api-node')
require('dotenv').config()

let scopes = ['playlist-modify-private',
              'playlist-read-private',
              'playlist-modify-public',
              'playlist-read-collaborative',
              'user-read-playback-state',
              'user-modify-playback-state',
              'user-read-currently-playing',
              'user-library-modify',
              'user-library-read',
              'user-read-playback-position',
              'user-read-recently-played',
              'user-top-read',
              'streaming',
              'user-follow-modify',
              'user-follow-read'
              ];
	state = 'login'

function getLoginURL() {
	let spotifyApi = new SpotifyWebApi({
		redirectUri: process.env.SPOTIFY_URI_DEV,
		clientId: process.env.SPOTIFY_CLIENT_ID
	})

	return spotifyApi.createAuthorizeURL(scopes, state)
}

function getTokens(code) {
	return new Promise((resolve, reject) => {
		let spotifyApi = new SpotifyWebApi({
			clientId: process.env.SPOTIFY_CLIENT_ID,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
			redirectUri: process.env.SPOTIFY_URI_DEV
		})

		spotifyApi.authorizationCodeGrant(code).then(function(data) {
			console.log('The token expires in ' + data.body['expires_in'])
			console.log('The access token is ' + data.body['access_token'])
			console.log('The refresh token is ' + data.body['refresh_token'])

			return resolve({
				'expires': data.body['expires_in'],
				'token': data.body['access_token'],
				'refresh': data.body['refresh_token']
			})
		},	function(err) {
			return reject('Something went wrong!', err)
		})
	})
}

module.exports = {
	getLoginURL,
	getTokens
}