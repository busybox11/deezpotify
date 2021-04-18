let body = document.querySelector('body')
let app = document.getElementById('app')
let player = document.getElementById('player')
let topNav = document.getElementById('topnav')
let bottomNavs = document.getElementById('bottom-navs')

let scrollPos;

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
	scroll = body.scrollTop
	body.scrollTop = 0
	body.style.overflow = "hidden"
	app.style.opacity = "0"
	app.style.zIndex = "-2"
	player.style.opacity = "1"
	player.style.zIndex = "2"
	bottomNavs.style.bottom = "-10rem"
	document.querySelector('#topnav-left-icon').outerHTML = '<i id="topnav-left-icon" class="iconify navbar-icons navbar-menu-icon" data-icon="mdi-chevron-down" onclick="closePlayingTrack()"></i>'
}

function closePlayingTrack() {
	body.scrollTop = scroll
	body.style.overflow = "auto"
	app.style.opacity = "1"
	app.style.zIndex = "2"
	player.style.opacity = "0"
	player.style.zIndex = "-2"
	bottomNavs.style.bottom = "0"
	document.querySelector('#topnav-left-icon').outerHTML = '<i id="topnav-left-icon" class="iconify navbar-icons navbar-menu-icon" data-icon="mdi-menu"></i>'
}