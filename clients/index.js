let SpotifyWebApi = require('spotify-web-api-node')

function login(platform, credentials) {
	return new Promise((resolve, reject) => {
		if (platform == "spotify") {
			let spotifyApi = new SpotifyWebApi()
			spotifyApi.setAccessToken(credentials.token);
			spotifyApi.setRefreshToken(credentials.refresh);
			return resolve(spotifyApi)
		}
	})
}

module.exports = {
	login
}