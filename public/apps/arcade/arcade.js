/* Arcade machine page. Plain ES5 so that even an old in-game browser can show a message;
   the Ruffle player itself needs WebAssembly (Garry's Mod's Chromium-based x86-64 branch). */
(function () {
	"use strict";

	var games = window.ARCADE_GAMES || {};

	function $(id) { return document.getElementById(id); }

	function param(name) {
		var m = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search);
		return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
	}

	function message(title, lines) {
		var box = $("message");
		box.innerHTML = "";
		var h = document.createElement("h1");
		h.textContent = title;
		box.appendChild(h);
		for (var i = 0; i < lines.length; i++) {
			var p = document.createElement("p");
			p.textContent = lines[i];
			box.appendChild(p);
		}
	}

	// Does games/<id>.swf exist?
	function installed(id, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("HEAD", "games/" + id + ".swf", true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) callback(xhr.status === 200);
		};
		xhr.send();
	}

	function play(id) {
		if (typeof WebAssembly !== "object") {
			message("OUT OF ORDER", ["The arcade needs Garry's Mod's x86-64 branch.",
				"In Steam: Garry's Mod > Properties > Betas > x86-64."]);
			return;
		}
		message("LOADING...", [games[id]]);
		window.RufflePlayer = window.RufflePlayer || {};
		window.RufflePlayer.config = {
			publicPath: "ruffle/",
			autoplay: "on",
			unmuteOverlay: "hidden",
			splashScreen: false,
			letterbox: "on",
			warnOnUnsupportedContent: false,
			showSwfDownload: false
		};
		var script = document.createElement("script");
		script.src = "ruffle/ruffle.js";
		script.onload = function () {
			var player = window.RufflePlayer.newest().createPlayer();
			$("message").style.display = "none";
			$("stage").appendChild(player);
			// Ruffle 0.6+ exposes the API through player.ruffle(); older builds had it on the element.
			(player.ruffle ? player.ruffle() : player).load({ url: "games/" + id + ".swf" });
			player.focus();
		};
		script.onerror = function () { message("OUT OF ORDER", ["The Flash player failed to load. Try again later."]); };
		document.body.appendChild(script);
	}

	function list() {
		$("title").textContent = "Arcade machines";
		$("stage").style.display = "none";
		var box = document.createElement("div"), table = document.createElement("table");
		box.id = "list";
		box.appendChild(table);
		document.body.appendChild(box);
		for (var id in games) {
			if (!games.hasOwnProperty(id)) continue;
			(function (id) {
				var tr = table.insertRow(-1), name = tr.insertCell(-1), state = tr.insertCell(-1);
				var a = document.createElement("a");
				a.href = "?game=" + id;
				a.textContent = games[id];
				name.appendChild(a);
				state.textContent = "checking...";
				installed(id, function (ok) {
					state.textContent = ok ? "installed" : "no game file";
					state.className = ok ? "on" : "off";
				});
			})(id);
		}
	}

	var id = (param("game") || param("flash")).toLowerCase();
	if (!id) { list(); return; }
	if (!/^[a-z0-9_]{1,40}$/.test(id) || !games.hasOwnProperty(id)) {
		message("GAME NOT FOUND", ["This machine doesn't have a game set up."]);
		return;
	}

	$("title").textContent = games[id];
	$("hint").textContent = "Click the game to give it the keyboard";
	installed(id, function (ok) {
		if (ok) play(id);
		else message("OUT OF ORDER", ["This machine is waiting for its game to be installed.", "Try another machine!"]);
	});
})();
