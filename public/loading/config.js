// Loading screen settings.
var LOADING_CONFIG = {
	// Player stats lookup. Leave empty until the API exists; the player card then stays hidden.
	// {steamid} is replaced with the player's SteamID64. The endpoint must return JSON:
	//   { "name": "MacDGuy", "avatar": "https://...jpg", "gmc": 1683229,
	//     "playtime": 11793600, "lastOnline": 1292502720, "vip": false }
	// playtime is in seconds, lastOnline is a Unix timestamp (both straight from gm_users).
	playerApi: "",

	// How long each hint stays up, in milliseconds.
	hintInterval: 8000
};
