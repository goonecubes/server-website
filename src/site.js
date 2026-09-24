// Everything that will change once real infrastructure exists lives here.
// Leave a link empty ("") to hide every button, menu item and sentence that uses it.
const links = {
	discord: "", // Discord invite, e.g. "https://discord.gg/abc123". Empty = no Discord anywhere on the site.
	workshop: "https://steamcommunity.com/sharedfiles/filedetails/?id=3482011813", // the collection the servers load
};

export const site = {
	name: "Skyline Tower",
	tagline: "Life Above the Clouds",

	// false while in closed beta: asks search engines not to index the site. Flip at launch.
	indexable: false,

	servers: [
		{ name: "Server #1", address: "195.26.248.118:27015" }, // TODO: switch to the domain once there is one
	],

	// Shown in the sidebar until the live status API exists.
	status: { label: "CLOSED BETA", players: "-- / --", map: "Lobby 2" },

	// Scrolling news ticker under the menu.
	ticker: [
		"Welcome to Skyline Tower! The lobby is open and the condos are waiting.",
		links.discord ? "Closed beta is underway. Join the Discord to get in on testing!" : "Closed beta is underway. Public launch is coming soon!",
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
	].filter((item) => item.href),

	sidebarLinks: [
		{ label: "Getting Started", href: "/downloads" },
		{ label: "Gamemodes", href: "/gamemodes" },
		{ label: "Leaderboards", href: "/stats" },
		{ label: "Latest Changes", href: "/changelog" },
		{ label: "Staff Team", href: "/staff" },
		{ label: "Help & FAQ", href: "/faq" },
		{ label: "Report a Bug", href: links.discord },
	].filter((item) => item.href),
};
