/* eslint-env browser */

/*
	global
		Plyr
		Hls
		keybindsBinds
		keybindsKeys
		isPi
*/

const omxplayer = require('../omxplayer');
const video = document.querySelector('video');
video.addEventListener('error', event => {
	console.log(error);
	const error = event.path[0].error;
	alert(error.message);
}, true);

const player = new Plyr(video, {
	controls: [
		'play-large',
		'play',
		'progress',
		'current-time',
		'duration',
	]
});

player.on('canplay', () => {
	player.play();
});

const playerWrapper = document.getElementById('player-wrapper');

function showPlayer() {
	if (!playerOpen()) {
		playerWrapper.classList.remove('hide');
	}
}

function hidePlayer() {
	if (player.playing) {
		player.pause();
	}

	if (playerOpen()) {
		playerWrapper.classList.add('hide');
	}
}

function playerOpen() {
	return !playerWrapper.classList.contains('hide');
}

function setPlayerBackground(image) {
	player.poster = image;
}

function startStream(stream) {
	if (isPi()) { // Pi's get to use omxplayer until I find something better
		omxplayer.init(stream.file);
	} else { // Non-pi systems get Plyr
		if (stream.m3u8 || stream.file.endsWith('.m3u8')) {
			if (Hls.isSupported()) {
				console.log(`Hls.isSupported() ${stream.file}`);
				const hls = new Hls();
				hls.loadSource(stream.file);
				hls.attachMedia(video);
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					video.play();
				});
			} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
				console.log(`video.canPlayType('application/vnd.apple.mpegurl') ${stream.file}`);
				video.src = stream.file;
				video.addEventListener('loadedmetadata', () => {
					video.play();
				});
			}
		} else {
			if (video.src !== stream.file) {
				video.src = stream.file;
			} else {
				player.play();
			}
		}
	
		showPlayer();
	}
}

function omxplayerKeyHandle(event) {
	if (!omxplayer.isPlaying()) {
		return;
	}

	event.preventDefault();
	
	let { key } = event;

	if (keybindsKeys.includes(key)) {
		key = keybindsBinds[keybindsKeys.indexOf(key)];
	}
	
	switch (key) {
		case '1':
			omxplayer.decreaseSpeed();
			break;
		case '2':
			omxplayer.increaseSpeed();
			break;
		case '<':
			omxplayer.rewind();
			break;
		case '>':
			omxplayer.fastForward();
			break;
		case 'z':
			omxplayer.showInfo();
			break;
		case 'j':
			omxplayer.previousAudioStream();
			break;
		case 'k':
			omxplayer.nextAudioStream();
			break;
		case 'i':
			omxplayer.previousChapter();
			break;
		case 'o':
			omxplayer.nextChapter();
			break;
		case 'n':
			omxplayer.previousSubtitleStream();
			break;
		case 'm':
			omxplayer.nextSubtitleStream();
			break;
		case 's':
			omxplayer.toggleSubtitles();
			break;
		case 'w':
			omxplayer.showSubtitles();
			break;
		case 'x':
			omxplayer.hideSubtitles();
			break;
		case 'd':
			omxplayer.decreaseSubtitleDelay();
			break;
		case 'f':
			omxplayer.increaseSubtitleDelay();
			break;
		case 'q':
		case 'goHome':
		case 'stopMediaLinux':
			omxplayer.quit();
			break;
		case 'p':
		case ' ':
		case 'select':
		case 'toggleMediaPlay':
			omxplayer.togglePlay();
			break;
		case '-':
		case 'volumeDown':
			omxplayer.decreaseVolume();
			break;
		case '+':
		case '=':
		case 'volumeUp':
			omxplayer.increaseVolume();
			break;
		case 'ArrowLeft':
		case 'moveLeft':
			omxplayer.seekBack30();
			break;
		case 'ArrowRight':
		case 'moveRight':
			omxplayer.seekForward30();
			break;
		case 'ArrowDown':
			omxplayer.seekBack600();
			break;
		case 'ArrowUp':
			omxplayer.seekForward600();
			break;
	}
}

function plyrKeyHandle(event) {
	if (player.playing) {
		event.preventDefault();
	}
	
	const { key } = event;

	if (!keybindsKeys.includes(key)) {
		return;
	}

	const bind = keybindsBinds[keybindsKeys.indexOf(key)];

	switch (bind) {
		case 'back':
			player.restart();
			break;
		case 'goHome':
		case 'stopMedia':
			hidePlayer();
			break;
		case 'select':
		case 'toggleMediaPlay':
			player.togglePlay();
			break;
		case 'moveRight':
			player.forward();
			break;
		case 'moveLeft':
			player.rewind();
			break;
		case 'volumeUp':
			player.increaseVolume();
			break;
		case 'volumeDown':
			player.decreaseVolume();
			break;
		default:
			break;
	}
}

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {
	this.startStream = startStream;
	this.showPlayer = showPlayer;
	this.hidePlayer = hidePlayer;
	this.playerOpen = playerOpen;
	this.setPlayerBackground = setPlayerBackground;
	this.omxplayerKeyHandle = omxplayerKeyHandle;
	this.plyrKeyHandle = plyrKeyHandle;
}();
