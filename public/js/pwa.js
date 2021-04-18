let body = document.querySelector('body')
let app = document.getElementById('app')
let player = document.getElementById('player')
let topNav = document.getElementById('topnav')
let bottomNavs = document.getElementById('bottom-navs')
let contextNavbar = document.getElementById('navbar-playing-context')

let scrollPos

let colorThief = new ColorThief();

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

const socket = io();

socket.on('clients', function(msg){
	console.log(msg)
});

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
	topNav.style.background = "linear-gradient(180deg, #00000050, transparent)"
	contextNavbar.style.visibility = "visible"
	contextNavbar.style.opacity = "1"
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
	topNav.style.background = ""
	contextNavbar.style.opacity = "0"
	contextNavbar.style.visibility = "hidden"
	document.querySelector('#topnav-left-icon').outerHTML = '<i id="topnav-left-icon" class="iconify navbar-icons navbar-menu-icon" data-icon="mdi-menu"></i>'
}

$(document).ready(function() {
	$("input[type=range]").rangeslider({
		polyfill: false,
		rangeClass: "rangeslider",
		disabledClass: "rangeslider--disabled",
		horizontalClass: "rangeslider--horizontal",
		verticalClass: "rangeslider--vertical",
		fillClass: "rangeslider__fill",
		handleClass: "rangeslider__handle"
	});
});