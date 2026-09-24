/* Piano sheet music: turns the note names in songs.js into the keys of the Lobby piano.
   Key layout from gmt_piano/shared.lua. Plain ES5. */
(function () {
	"use strict";

	var songs = window.PIANO_SONGS || [];
	var advanced = /[?&]adv=1/.test(window.location.search);

	function $(id) { return document.getElementById(id); }

	// Note number -> key label. MIDI numbering: C4 (middle C) = 60.
	// Advanced mode: 25 white keys from C2 (1 2 3 ... g), black keys with Shift.
	// Basic mode: the white keys A..' start at middle C, black keys W E T Y U O P.
	var WHITE_STEPS = [0, 2, 4, 5, 7, 9, 11], BLACK_STEPS = [1, 3, 6, 8, 10];
	function layout(firstOctaveNote, whiteLabels, blackLabels) {
		var map = {}, i, n;
		for (i = 0; i < whiteLabels.length; i++) {
			n = firstOctaveNote + Math.floor(i / 7) * 12 + WHITE_STEPS[i % 7];
			map[n] = { key: whiteLabels[i], black: false };
		}
		for (i = 0; i < blackLabels.length; i++) {
			n = firstOctaveNote + Math.floor(i / 5) * 12 + BLACK_STEPS[i % 5];
			map[n] = { key: blackLabels[i], black: true };
		}
		return map;
	}
	var KEYS = advanced
		? layout(36, "1234567890qwertyuiopasdfg".split(""), "!@$%^*(QWETYIOPSD".split(""))
		: layout(60, ["A", "S", "D", "F", "G", "H", "J", "K", "L", ":", "'"], ["W", "E", "T", "Y", "U", "O", "P"]);

	var NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
	function noteNumber(token) {
		var m = /^([A-G])(#|b)?(-?\d)$/.exec(token);
		if (!m) return null;
		return (parseInt(m[3], 10) + 1) * 12 + NAMES[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
	}

	// Songs that don't fit this piano are moved. The written key is kept when it fits; otherwise
	// the shift with the fewest black keys wins, preferring whole octaves, then small moves.
	function fitShift(tokens) {
		var best = null, bestCost = Infinity;
		for (var shift = -24; shift <= 24; shift++) {
			var ok = true, blacks = 0;
			for (var j = 0; j < tokens.length && ok; j++) {
				var n = noteNumber(tokens[j]);
				if (n === null) continue;
				var key = KEYS[n + shift];
				if (!key) ok = false;
				else if (key.black) blacks++;
			}
			if (!ok) continue;
			if (shift === 0) return 0;
			var cost = blacks + (shift % 12 === 0 ? 0 : 2) + Math.abs(shift) / 100;
			if (cost < bestCost) { best = shift; bestCost = cost; }
		}
		return best;
	}

	function show(index) {
		var song = songs[index], box = $("keys"), foot = $("foot");
		box.innerHTML = "";
		box.scrollTop = 0;
		var all = song.notes.replace(/\|/g, " ").split(/\s+/);
		var shift = fitShift(all);

		var mode = advanced ? "Advanced keys: hold Shift for the yellow keys" : "Basic keys: Ctrl on the piano switches to advanced";
		if (shift === null) {
			box.innerHTML = "<p>This song doesn't fit the basic keys.<br>Press Ctrl on the piano for advanced mode.</p>";
			foot.textContent = mode;
			return;
		}
		if (shift % 12 === 0 && shift !== 0) mode += " · moved " + (shift > 0 ? "up " : "down ") + Math.abs(shift / 12) + " octave" + (Math.abs(shift) > 12 ? "s" : "");
		else if (shift !== 0) mode += " · changed key to fit";
		foot.textContent = mode;

		var lines = song.notes.split("|");
		for (var l = 0; l < lines.length; l++) {
			var line = document.createElement("div"), tokens = lines[l].replace(/^\s+|\s+$/g, "").split(/\s+/);
			line.className = "line";
			for (var t = 0; t < tokens.length; t++) {
				var span = document.createElement("span");
				if (tokens[t] === "-") {
					span.className = "gap";
				} else {
					var n = noteNumber(tokens[t]);
					if (n === null) continue;
					var key = KEYS[n + shift];
					span.className = key.black ? "k black" : "k";
					span.textContent = key.key;
				}
				line.appendChild(span);
				line.appendChild(document.createTextNode(" "));
			}
			box.appendChild(line);
		}
		try { window.localStorage.setItem("pianoSong", String(index)); } catch (e) { /* storage unavailable */ }
	}

	var select = $("song");
	for (var i = 0; i < songs.length; i++) {
		var opt = document.createElement("option");
		opt.value = String(i);
		opt.textContent = songs[i].title;
		select.appendChild(opt);
	}
	var start = 0;
	try { start = parseInt(window.localStorage.getItem("pianoSong"), 10) || 0; } catch (e) { start = 0; }
	if (start < 0 || start >= songs.length) start = 0;
	select.value = String(start);

	function go(delta) {
		var next = (parseInt(select.value, 10) + delta + songs.length) % songs.length;
		select.value = String(next);
		show(next);
	}
	select.onchange = function () { show(parseInt(select.value, 10)); };
	$("prev").onclick = function (e) { if (e && e.preventDefault) e.preventDefault(); go(-1); return false; };
	$("next").onclick = function (e) { if (e && e.preventDefault) e.preventDefault(); go(1); return false; };
	show(start);
})();
