// Everything that will change once real infrastructure exists lives here.
// Values marked TODO are placeholders until the VPS, Discord, and Workshop collection are set up.
const links = {
	discord: "https://discord.gg/TODO", // TODO
	workshop: "https://steamcommunity.com/sharedfiles/filedetails/?id=TODO", // TODO: Workshop collection
	steamGroup: "https://steamcommunity.com/groups/TODO", // TODO
	youtube: "https://www.youtube.com/@TODO", // TODO
};

export const site = {
	name: "Skyline Tower",
	tagline: "Life Above the Clouds",

	servers: [
		{ name: "Server #1", address: "join.skylinetower.example" }, // TODO: real address
	],

	// Shown in the sidebar until the live status API exists.
	status: { label: "CLOSED BETA", players: "-- / --", map: "Lobby 2" },

	// Scrolling news ticker under the menu.
	ticker: [
		"Welcome to Skyline Tower! The lobby is open and the condos are waiting.",
		"Closed beta is underway. Join the Discord to get in on testing!",
		"Condos now save your layout between visits.",
		"Lobby events are back: Balloon Pop, Chainsaw Battle, Snowball Fight and more.",
	],

	links,

	nav: [
		{ label: "Home", href: "/" },
		{ label: "Changelog", href: "/changelog" },
		{ label: "Downloads", href: "/downloads" },
		{ label: "Gamemodes", href: "/gamemodes" },
		{ label: "About", href: "/about" },
		{ label: "FAQ", href: "/faq" },
		{ label: "Stats", href: "/stats" },
		{ label: "Staff", href: "/staff" },
		{ label: "Discord", href: links.discord, external: true },
	],

	sidebarLinks: [
		{ label: "Getting Started", href: "/downloads" },
		{ label: "Gamemodes", href: "/gamemodes" },
		{ label: "Leaderboards", href: "/stats" },
		{ label: "Latest Changes", href: "/changelog" },
		{ label: "Staff Team", href: "/staff" },
		{ label: "Help & FAQ", href: "/faq" },
		{ label: "Report a Bug", href: links.discord },
	],
};
