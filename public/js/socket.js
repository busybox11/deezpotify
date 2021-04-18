function msToTime(duration) {
	var seconds = parseInt((duration/1000)%60)
		, minutes = parseInt((duration/(1000*60))%60)

	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return `${minutes}:${seconds}`;
}

function setPlayingState(state) {
	class PlayingNav {
		static coverImg      = document.querySelector('#playing-img')
		static trackName     = document.querySelector('#playing-track-name')
		static trackArtist   = document.querySelector('#playing-track-artist')
		static savedIcon     = document.querySelector('#playing-nav-save')
		static playPauseIcon = document.querySelector('#playing-nav-playpause')
	}

	class Player {
		static player        = document.querySelector('#player')
		static coverImg      = document.querySelector('#player-cover')
		static trackName     = document.querySelector('#player-track-name')
		static trackArtist   = document.querySelector('#player-track-artist')
		static savedIcon     = document.querySelector('#playing-track-info-save')
		static playPauseIcon = document.querySelector('#player-controls-playpause')
		static deviceName    = document.querySelector('#player-device-controls-active-name')
		static timeSeekbar   = document.querySelector('#player-position-range')
		static timeNow       = document.querySelector('#player-position-time-current')
		static timeTotal     = document.querySelector('#player-position-time-song')
	}

	class Track {
		static name      = state.item.name
		static artist    = state.item.artists[0].name
		static coverImgS = state.item.album.images[state.item.album.images.length - 1].url
		static coverImgL = state.item.album.images[0].url
		static isPlaying = state.is_playing
		static timeNow   = msToTime(state.progress_ms)
		static timeTotal = msToTime(state.item.duration_ms)
	}

	PlayingNav.playPauseIcon.outerHTML = ((Track.isPlaying) ? '<i class="iconify playing-nav-icon" id="playing-nav-playpause" data-icon="mdi-pause"></i>' : '<i class="iconify playing-nav-icon" id="playing-nav-playpause" data-icon="mdi-play"></i>')
	Player.playPauseIcon.outerHTML     = ((Track.isPlaying) ? '<i id="player-controls-playpause" class="iconify player-controls-icon" data-icon="mdi-pause"></i>' : '<i id="player-controls-playpause" class="iconify player-controls-icon" data-icon="mdi-play"></i>')

	PlayingNav.trackName.innerHTML     = Track.name
	Player.trackName.innerHTML         = Track.name
	PlayingNav.trackArtist.innerHTML   = Track.artist
	Player.trackArtist.innerHTML       = Track.artist

	PlayingNav.coverImg.src            = Track.coverImgS
	Player.coverImg.src                = Track.coverImgL

	Player.timeNow.innerHTML           = Track.timeNow
	Player.timeNow.msTime              = state.progress_ms
	Player.timeTotal.innerHTML         = Track.timeTotal
	Player.timeTotal.msTime            = state.item.duration_ms

	Player.coverImg.onload = function() {
		color = colorThief.getColor(Player.coverImg)
		Player.player.style.backgroundColor = `rgb(${color[0]},${color[1]},${color[2]})`
	}
}

socket.on('playing', function(msg) {
	data = JSON.parse(msg)

	switch (data.type) {
		case "currentPlaybackState":
			setPlayingState(data.data)
			break

		case "periodicPlaybackState":
			if (data.data.item != undefined) {
				setPlayingState(data.data)
			} else {
				let timeNow   = document.querySelector('#player-position-time-current')
				let timeTotal = document.querySelector('#player-position-time-song')
				timeNow.innerHTML = msToTime(data.data.progress_ms)
				timeNow.msTime    = data.data.progress_ms

				$('#player-position-range').val(timeNow.msTime * 100 / timeTotal.msTime).change()
			}
			break
	}
});