/* GMod Tower loading screen logic. Plain ES5: must run in Garry's Mod's Awesomium (old WebKit). */
(function () {
	"use strict";

	var STAGE_W = 921, STAGE_H = 612;
	var TOP_BAR = 112, BOTTOM_BAR = 84;

	var data = window.LOADING_DATA || { maps: {}, gamemodes: [] };
	var config = window.LOADING_CONFIG || {};

	function $(id) { return document.getElementById(id); }

	function params() {
		var out = {}, q = window.location.search.replace(/^\?/, "").split("&");
		for (var i = 0; i < q.length; i++) {
			if (!q[i]) continue;
			var kv = q[i].split("=");
			out[decodeURIComponent(kv[0])] = kv.length > 1 ? decodeURIComponent(kv.slice(1).join("=").replace(/\+/g, " ")) : "";
		}
		return out;
	}

	function commas(n) {
		return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function pad(n) { return (n < 10 ? "0" : "") + n; }

	function setText(el, text) { el.textContent = text; }

	/* ---------- layout: scale the 921x612 stage to the screen ---------- */

	function layout() {
		var w = window.innerWidth, h = window.innerHeight;
		var s = Math.min(w / STAGE_W, h / STAGE_H);
		var left = Math.round((w - STAGE_W * s) / 2), top = Math.round((h - STAGE_H * s) / 2);
		var stage = $("stage");
		var t = "translate(" + left + "px," + top + "px) scale(" + s + ")";
		stage.style.webkitTransform = t;
		stage.style.transform = t;

		// Bars run the full screen width, lined up with the stage's top and bottom.
		$("topbar").style.top = "0px";
		$("topbar").style.height = Math.round(top + TOP_BAR * s) + "px";
		$("bottombar").style.top = Math.round(top + (STAGE_H - BOTTOM_BAR) * s) + "px";
		$("bottombar").style.height = Math.round(h - (top + (STAGE_H - BOTTOM_BAR) * s)) + "px";
	}

	/* ---------- map and gamemode lookup ---------- */

	var currentMap = null;

	function findMap(map) {
		map = (map || "").toLowerCase();
		if (data.maps[map]) return data.maps[map];
		// Map files carry revision suffixes (gmt_virus_dust03), so use the longest known prefix.
		var best = null, bestLen = 0;
		for (var key in data.maps) {
			if (data.maps.hasOwnProperty(key) && map.indexOf(key) === 0 && key.length > bestLen) {
				best = data.maps[key];
				bestLen = key.length;
			}
		}
		return best;
	}

	function findGamemode(map, gamemode) {
		var gms = data.gamemodes, i;
		gamemode = (gamemode || "").toLowerCase();
		for (i = 0; i < gms.length; i++) {
			if (gamemode && gms[i].id === gamemode) return gms[i];
		}
		map = (map || "").toLowerCase();
		for (i = 0; i < gms.length; i++) {
			if (map.indexOf(gms[i].prefix) === 0) return gms[i];
		}
		return gms[gms.length - 1] || null;
	}

	function showMap(map, gamemode) {
		if (!map || map === currentMap) return;
		currentMap = map;

		var info = findMap(map);
		var gm = findGamemode(map, gamemode);

		setText($("title"), info ? info.name : map);
		setText($("author"), info && info.author ? "by " + info.author : "");
		setText($("desc"), info && info.desc ? info.desc : "");

		if (info && info.image) {
			var url = "url('" + info.image + "')";
			$("preview").style.backgroundImage = url;
			$("bg").style.backgroundImage = url;
		}

		if (gm) {
			$("banner").src = gm.logo;
			$("banner").alt = gm.name;
			document.body.className = document.body.className.replace(/\blogo-mode\b/g, "") + (gm.banner ? "" : " logo-mode");
			if (gm.banner) {
				$("banner").style.top = "";
				$("banner").style.left = "";
			} else {
				centerLogo();
			}
			setTips(gm.tips);
		}
	}

	// Non-Lobby logos vary in size: fit each inside 270x104 and centre it on the bar (bar centre y = 68).
	function centerLogo() {
		var img = $("banner");
		function place() {
			var w = img.naturalWidth || 270, h = img.naturalHeight || 104;
			var scale = Math.min(1, 270 / w, 104 / h);
			img.style.left = "20px";
			img.style.top = Math.round(68 - h * scale / 2) + "px";
		}
		if (img.complete && img.naturalWidth) place(); else img.onload = place;
	}

	/* ---------- hints ---------- */

	var tips = [], tipIndex = 0, tipTimer = null;

	function setTips(list) {
		tips = list && list.length ? list.slice() : ["Remember to always brush your teeth!"];
		// Shuffle so every load starts somewhere different.
		for (var i = tips.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1)), t = tips[i];
			tips[i] = tips[j];
			tips[j] = t;
		}
		tipIndex = 0;
		setText($("hint-tip"), tips[0]);
		if (tipTimer) clearInterval(tipTimer);
		tipTimer = setInterval(nextTip, config.hintInterval || 8000);
	}

	function nextTip() {
		var el = $("hint-text");
		tipIndex = (tipIndex + 1) % tips.length;
		el.style.opacity = "0";
		setTimeout(function () {
			setText($("hint-tip"), tips[tipIndex]);
			el.style.opacity = "1";
		}, 400);
	}

	/* ---------- download progress ---------- */

	var filesTotal = 0, filesNeeded = 0, stageFloor = 0, shown = 0;

	// Workshop content arrives without file counts, so each loading stage also moves
	// the bar to at least a set point. The bar never moves backwards.
	var STAGES = [
		[/retrieving server info/i, 5],
		[/mounting addons|workshop/i, 15],
		[/server cache/i, 30],
		[/downloading|received/i, 40],
		[/workshop complete/i, 60],
		[/sending client info/i, 80],
		[/client info sent/i, 88],
		[/starting lua|lua started/i, 95]
	];

	function updateProgress() {
		var pct = stageFloor;
		if (filesTotal > 0) {
			// File downloads fill the stretch between 40% and 80%.
			var done = Math.max(0, Math.min(1, (filesTotal - filesNeeded) / filesTotal));
			pct = Math.max(pct, 40 + Math.round(done * 40));
		}
		shown = Math.max(shown, Math.min(100, pct));
		$("progress-fill").style.width = shown + "%";
	}

	function stageOf(status) {
		for (var i = 0; i < STAGES.length; i++) {
			if (STAGES[i][0].test(status)) stageFloor = Math.max(stageFloor, STAGES[i][1]);
		}
		updateProgress();
	}

	/* ---------- optional trace: config.trace logs each callback to the web server's access log ---------- */

	function trace(name, value) {
		if (!config.trace) return;
		var img = new Image();
		img.src = "trace.gif?cb=" + encodeURIComponent(name) + "&v=" + encodeURIComponent(String(value).slice(0, 80)) + "&t=" + new Date().getTime();
	}
	trace("pageload", navigator.userAgent);

	/* ---------- player card ---------- */

	function formatDate(unix) {
		var d = new Date(unix * 1000), h = d.getHours();
		return pad(d.getMonth() + 1) + "/" + pad(d.getDate()) + "/" + String(d.getFullYear()).slice(2) + " @ " + pad(h) + ":" + pad(d.getMinutes());
	}

	function showPlayer(p) {
		if (!p || !p.name) return;
		setText($("name"), p.name);
		$("name").className = "outlined" + (p.vip ? " vip" : "");
		if (p.avatar) $("avatar").style.backgroundImage = "url('" + String(p.avatar).replace(/'/g, "%27") + "')";

		var stats = $("stats");
		stats.innerHTML = "";
		function line(label, value) {
			var div = document.createElement("div"), b = document.createElement("b");
			setText(b, label + " ");
			div.appendChild(b);
			div.appendChild(document.createTextNode(value));
			stats.appendChild(div);
		}
		if (p.gmc != null) line("GMC:", commas(p.gmc));
		if (p.playtime != null) line("Playtime:", commas(p.playtime / 3600) + " hours");
		if (p.lastOnline) {
			var gap = document.createElement("div");
			gap.className = "gap";
			stats.appendChild(gap);
			var b = document.createElement("b");
			b.className = "label-line";
			setText(b, "Last Join");
			stats.appendChild(b);
			var when = document.createElement("div");
			setText(when, formatDate(p.lastOnline));
			stats.appendChild(when);
		}
		if (document.body.className.indexOf("has-player") < 0) document.body.className += " has-player";
	}

	var requestedFor = null;

	function loadPlayer(steamid) {
		if (!config.playerApi || !/^\d{17}$/.test(steamid || "") || steamid === requestedFor) return;
		requestedFor = steamid;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", config.playerApi.replace("{steamid}", steamid), true);
		xhr.timeout = 5000;
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4 || xhr.status !== 200) return;
			try { showPlayer(JSON.parse(xhr.responseText)); } catch (e) { /* bad response: leave the card hidden */ }
		};
		xhr.send();
	}

	/* ---------- clock ---------- */

	function tick() {
		var d = new Date(), h = d.getHours() % 12 || 12;
		setText($("clock"), h + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + (d.getHours() < 12 ? " AM" : " PM"));
	}

	/* ---------- Garry's Mod callbacks (must be globals) ---------- */

	window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode) {
		trace("GameDetails", mapname + " " + gamemode);
		showMap(mapname, gamemode);
		loadPlayer(steamid);
	};

	window.SetFilesTotal = function (total) {
		trace("SetFilesTotal", total);
		filesTotal = total;
		updateProgress();
	};

	window.SetFilesNeeded = function (needed) {
		if (needed === 0 || needed % 25 === 0) trace("SetFilesNeeded", needed);
		filesNeeded = needed;
		updateProgress();
	};

	window.DownloadingFile = function (fileName) {
		var name = String(fileName).split("/").pop();
		setText($("status"), "Downloading " + name + (filesTotal ? " (" + (filesTotal - filesNeeded + 1) + " of " + filesTotal + ")" : ""));
		stageOf("downloading");
	};

	window.SetStatusChanged = function (status) {
		trace("SetStatusChanged", status);
		setText($("status"), status);
		// Garry's Mod stops reporting file counts once downloads are done.
		if (/sending client info|client info sent|starting lua|lua started/i.test(status)) filesNeeded = 0;
		stageOf(status);
	};

	/* ---------- demo mode (?demo) for previewing in a normal browser ---------- */

	function demo(p) {
		config.trace = false;
		var map = p.map || "gmt_lobby2_r10";
		window.GameDetails("GMod Tower", "", map, 64, "76561197960287930", "");
		showPlayer({ name: "MacDGuy", gmc: 1683229, playtime: 3276 * 3600, lastOnline: 1292502720, vip: false });
		var total = 140, left = total;
		window.SetFilesTotal(total);
		window.SetFilesNeeded(left);
		var files = ["maps/" + map + ".bsp", "materials/gmod_tower/lobby/hud/mainhud.vtf", "models/gmod_tower/elevator.mdl", "sound/gmodtower/lobby/elevator/ride1.mp3"];
		var timer = setInterval(function () {
			if (left <= 0) {
				clearInterval(timer);
				window.SetStatusChanged("Sending client info...");
				return;
			}
			window.DownloadingFile(files[left % files.length]);
			left -= 1;
			window.SetFilesNeeded(left);
		}, 120);
	}

	/* ---------- start ---------- */

	var p = params();
	layout();
	window.onresize = layout;
	tick();
	setInterval(tick, 1000);
	setTips(null);

	if (p.map) showMap(p.map, p.gamemode);
	if (p.steamid) loadPlayer(p.steamid);
	if (p.hasOwnProperty("demo")) demo(p);
	if (!currentMap) showMap("gmt_lobby2", "gmtlobby");
})();
