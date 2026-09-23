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

	links,

	nav: [
		{ label: "News", href: "/" },
		{ label: "Changelog", href: "/changelog" },
		{ label: "Downloads", href: "/downloads" },
		{ label: "Discord", href: links.discord, external: true },
		{ label: "About", href: "/about" },
		{ label: "Gamemodes", href: "/gamemodes" },
		{ label: "FAQs", href: "/faq" },
		{ label: "Stats", href: "/stats" },
		{ label: "Staff", href: "/staff" },
	],
};
