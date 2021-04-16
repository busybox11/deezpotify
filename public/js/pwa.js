let topnav = document.getElementById('topnav')

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
		topnav.classList.add('scrolled')
	} else {
		try {
			topnav.classList.remove('scrolled')
		} catch(e) {}
	}
}