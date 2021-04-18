let SpotifyWebApi = require('spotify-web-api-node')
require('dotenv').config()

function login(platform, credentials) {
	return new Promise((resolve, reject) => {
		if (platform == "spotify") {
			let spotifyApi = new SpotifyWebApi({
				clientId: process.env.SPOTIFY_CLIENT_ID,
				clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
				redirectUri: process.env.SPOTIFY_URI_PROD
			})
			spotifyApi.setAccessToken(credentials.token);
			spotifyApi.setRefreshToken(credentials.refresh);
			return resolve(spotifyApi)
		}
	})
}

module.exports = {
	login
}