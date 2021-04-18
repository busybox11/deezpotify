let app = document.getElementById('app')
let topNav = document.getElementById('topnav')
let bottomNavs = document.getElementById('bottom-navs')

document.addEventListener('DOMContentLoaded', init, false)

function init() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/js/service-worker.js')
		.then((reg) => {
			console.log('Service worker registered -->', reg)
		}, (err) => {
			console.error('Service worker not registered -->', err)
		})
	}
}

document.onscroll = function(data) {
	if (window.pageYOffset > 100) {
		topNav.classList.add('scrolled')
	} else {
		try {
			topnav.classList.remove('scrolled')
		} catch(e) {}
	}
}

function openPlayingTrack() {
	app.style.opacity = "0"
	bottomNavs.style.bottom = "-10rem"
	document.querySelector('#topnav-left-icon').outerHTML = '<i id="topnav-left-icon" class="iconify navbar-icons navbar-menu-icon" data-icon="mdi-chevron-down" onclick="closePlayingTrack()"></i>'
}

function closePlayingTrack() {
	app.style.opacity = "1"
	bottomNavs.style.bottom = "0"
	document.querySelector('#topnav-left-icon').outerHTML = '<i id="topnav-left-icon" class="iconify navbar-icons navbar-menu-icon" data-icon="mdi-menu"></i>'
}