/* Piano sheet music: shows one song from songs.json at a time. Plain ES5. */
(function () {
	"use strict";

	var mode = /[?&]adv=1/.test(window.location.search) ? "advanced" : "basic";
	var songs = [], index = 0;
	var STORE = "pianoSong_" + mode;

	function $(id) { return document.getElementById(id); }

	function show(i) {
		if (!songs.length) return;
		index = (i % songs.length + songs.length) % songs.length;
		var song = songs[index];

		var title = $("title");
		title.innerHTML = "";
		title.appendChild(document.createTextNode(song.title));
		if (song.by) {
			var by = document.createElement("i");
			by.appendChild(document.createTextNode(song.by));
			title.appendChild(document.createTextNode(" | "));
			title.appendChild(by);
		}

		// Long songs have to fit above the key bar: first drop the blank lines some sheets use
		// as spacing, then shrink the text.
		var notes = $("notes"), music = notes.parentNode, room = window.innerHeight - 22;
		var texts = [song.keys, song.keys.replace(/\n\s*\n/g, "\n")];
		for (var t = 0; t < texts.length; t++) {
			notes.textContent = texts[t];
			for (var size = 12; size >= 8; size--) {
				music.style.fontSize = size + "px";
				if (music.offsetHeight <= room) break;
			}
			if (music.offsetHeight <= room && (size >= 10 || t === texts.length - 1)) break;
		}

		$("key").textContent = (index + 1) + " / " + songs.length;
		try { window.localStorage.setItem(STORE, String(index)); } catch (e) { /* storage unavailable */ }
	}

	// The piano's arrow keys call these (gmt_instrument_base: SheetMusicBack/Forward).
	window.pageBack = function () { show(index - 1); };
	window.pageForward = function () { show(index + 1); };

	$("mode").textContent = mode === "advanced" ? "Advanced" : "Basic";

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "songs.json", true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState !== 4) return;
		try { songs = JSON.parse(xhr.responseText)[mode] || []; } catch (e) { songs = []; }
		if (!songs.length) { $("notes").textContent = "No sheet music yet."; return; }

		var m = /[?&]type=(-?\d+)/.exec(window.location.search), start = 0;
		if (m) start = parseInt(m[1], 10);
		else try { start = parseInt(window.localStorage.getItem(STORE), 10) || 0; } catch (e) { start = 0; }
		show(start);
	};
	xhr.send();
})();
