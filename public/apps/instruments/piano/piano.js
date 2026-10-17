/* Piano sheet music: shows one GMod Tower .sht sheet at a time. Plain ES5. */
(function () {
	"use strict";

	var mode = /[?&]adv=1/.test(window.location.search) ? "advanced" : "basic";
	var songs = [], index = 0, cache = {}, request = 0;
	var STORE = "pianoSong_" + mode;

	function $(id) { return document.getElementById(id); }

	// A sheet's notes as text: <br> is a line break, everything else is text (the browser
	// collapses the source's own newlines, exactly like the original page did).
	function notesText(node) {
		var out = "", i, child;
		for (i = 0; i < node.childNodes.length; i++) {
			child = node.childNodes[i];
			if (child.nodeType === 3) out += child.nodeValue.replace(/[ \t\r\n]+/g, " ");
			else if (child.nodeName && child.nodeName.toUpperCase() === "BR") out += "\n";
			else out += notesText(child);
		}
		return out;
	}

	function tidy(text) {
		var raw = text.split("\n"), lines = [], i;
		for (i = 0; i < raw.length; i++) lines.push(raw[i].replace(/^\s+|\s+$/g, ""));
		while (lines.length && !lines[0]) lines.shift();
		while (lines.length && !lines[lines.length - 1]) lines.pop();
		return lines.join("\n");
	}

	function sheetKeys(text) {
		var box = document.createElement("div"), notes = null, divs, i;
		box.innerHTML = text;
		if (box.getElementsByClassName) notes = box.getElementsByClassName("notes")[0];
		if (!notes) {
			divs = box.getElementsByTagName("div");
			for (i = 0; i < divs.length; i++) {
				if (divs[i].className === "notes") { notes = divs[i]; break; }
			}
		}
		return notes ? tidy(notesText(notes)) : "";
	}

	function fit() {
		var notes = $("notes"), music = notes.parentNode, room = window.innerHeight - 22;
		var text = notes.textContent, compact = text.replace(/\n\s*\n/g, "\n"), size;
		var texts = [text, compact];
		for (var t = 0; t < texts.length; t++) {
			notes.textContent = texts[t];
			for (size = 12; size >= 8; size--) {
				music.style.fontSize = size + "px";
				if (music.offsetHeight <= room) break;
			}
			if (music.offsetHeight <= room && (size >= 10 || t === texts.length - 1)) break;
		}
	}

	function show(i) {
		if (!songs.length) return;
		index = (i % songs.length + songs.length) % songs.length;
		var song = songs[index], token = ++request;

		var title = $("title");
		title.innerHTML = "";
		title.appendChild(document.createTextNode(song.title || "Untitled"));
		if (song.by) {
			var by = document.createElement("i");
			by.appendChild(document.createTextNode(song.by));
			title.appendChild(document.createTextNode(" | "));
			title.appendChild(by);
		}

		var credit = song.sheetBy ? " \u00b7 Sheet by: " + song.sheetBy : "";
		$("key").textContent = (index + 1) + " / " + songs.length + credit;
		try { window.localStorage.setItem(STORE, String(index)); } catch (e) { /* storage unavailable */ }

		var cached = cache[song.file];
		if (cached !== undefined) {
			$("notes").textContent = cached;
			fit();
			return;
		}

		$("notes").textContent = "";
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "sheets/" + mode + "/" + encodeURIComponent(song.file), true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;
			var text = xhr.responseText && (xhr.status === 200 || xhr.status === 0) ? sheetKeys(xhr.responseText) : "";
			if (text) cache[song.file] = text;
			if (token !== request) return;
			$("notes").textContent = text || "Sheet unavailable.";
			fit();
		};
		xhr.send();
	}

	// The piano's arrow keys call these (gmt_instrument_base: SheetMusicBack/Forward).
	window.pageBack = function () { show(index - 1); };
	window.pageForward = function () { show(index + 1); };

	$("mode").textContent = mode === "advanced" ? "Advanced" : "Basic";

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "sheets/index.json", true);
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
