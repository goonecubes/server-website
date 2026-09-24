// Loading screen settings.
var LOADING_CONFIG = {
	// Player stats lookup. Empty hides the player card; so does a player with no saved data yet.
	// {steamid} is replaced with the player's SteamID64. The endpoint must return JSON:
	//   { "name": "MacDGuy", "avatar": "https://...jpg", "gmc": 1683229,
	//     "playtime": 11793600, "lastOnline": 1292502720, "vip": false }
	// playtime is in seconds, lastOnline is a Unix timestamp (both straight from gm_users).
	// Written once a minute on the VPS by skyline_live.py.
	playerApi: "/live/players/{steamid}.json",

	// How long each hint stays up, in milliseconds.
	hintInterval: 8000,

	// Debugging only: request trace.gif for every Garry's Mod callback so the calls
	// show up in the web server's access log. Turn off once loading is confirmed working.
	trace: false
};
