// Player caps come from gmodtower/gamemode/base/multiserver/gamemodes/*.lua (GMode.MaxPlayers).
// Map names and preview images come from tools/import-gmt-assets.py (writes maps.json).
// Banners and logos are the original GMod Tower art, imported by that same script.
import maps from "./maps.json";

export const released = [
	{
		id: "lobby",
		name: "Lobby",
		players: "All players",
		desc: "The heart of the tower, and the only place that connects to everything else. Rent a condo and decorate it however you like, shop the stores, catch a movie at the theater, try your luck in the casino and arcade, or just hang out at the plaza and the beach. Every game starts here and every game brings you back.",
		banner: null, // No original Lobby banner exists; drop a 2048x256 screenshot in public/img/banners/lobby.jpg and point this at it.
		logo: null,
		maps: [{ id: "gmt_lobby2_r10", name: "Lobby 2", image: "/img/gmt/shots/condo1.jpg" }],
	},
	{
		id: "ballrace",
		name: "Ball Race",
		players: "8 players",
		desc: "Roll your way through floating obstacle courses in this Super Monkey Ball-inspired race, grabbing bananas as you go. Bumpers, repellers, attractors, buttons and lasers all stand between you and the goal. Just don't roll off the edge.",
		banner: "/img/gmt/banners/ballrace.jpg",
		logo: "/img/gmt/logos/ballrace.png",
		maps: maps.ballrace,
	},
	{
		id: "virus",
		name: "Virus",
		players: "12 players",
		desc: "Inspired by the Virus mode from the TimeSplitters series. One unlucky player starts out infected. Everyone else has to hold out until the timer runs dry, because a single touch from the infected turns you into one of them.",
		banner: "/img/gmt/banners/virus.jpg",
		logo: "/img/gmt/logos/virus.png",
		maps: maps.virus,
	},
	{
		id: "pvpbattle",
		name: "PVP Battle",
		players: "8 players",
		desc: "A wacky deathmatch in the spirit of Jaykin' Bacon: Source. Grab an arsenal of ridiculous weapons and fight through short, explosive matches across a dozen arenas. Fast, loud, and never fair.",
		banner: "/img/gmt/banners/pvpbattle.jpg",
		logo: "/img/gmt/logos/pvpbattle.png",
		maps: maps.pvpbattle,
	},
	{
		id: "uch",
		name: "Ultimate Chimera Hunt",
		players: "11 players",
		desc: "Based on the Chimera Lab from MOTHER 3. One player becomes the Ultimate Chimera, a huge pink monster. Everyone else is a Pigmask who has to sneak up and press the big button on its back before getting eaten. Original gamemode by Aska and Fluxmage.",
		banner: "/img/gmt/banners/ultimatechimerahunt.jpg",
		logo: "/img/gmt/logos/uch.png",
		maps: maps.ultimatechimerahunt,
	},
	{
		id: "zombiemassacre",
		name: "Zombie Massacre",
		players: "6 players",
		desc: "A top-down arcade zombie shooter. Team up, grab weapons and power-ups, and survive waves of the undead. Depending on the map you'll be holding out, pushing forward, or taking on a boss.",
		banner: "/img/gmt/banners/zombiemassacre.jpg",
		logo: "/img/gmt/logos/zombiemassacre.png",
		maps: maps.zombiemassacre,
	},
	{
		id: "minigolf",
		name: "Minigolf",
		players: "12 players",
		desc: "Classic miniature golf on wacky courses. Line up your shot, watch the bounce, and try to finish with the lowest score. A relaxed way to spend a round with friends.",
		banner: "/img/gmt/banners/minigolf.jpg",
		logo: "/img/gmt/logos/minigolf.png",
		maps: maps.minigolf,
	},
];

export const inProduction = [
	{
		id: "sourcekarts",
		name: "Source Karts",
		players: "6 players",
		desc: "Kart racing, tower style. Drift, boost, and throw items at your friends on the way to the finish line.",
		banner: "/img/gmt/banners/sourcekarts2.jpg",
		logo: "/img/gmt/logos/sourcekarts.png",
		maps: maps.sourcekarts,
	},
	{
		id: "gourmetrace",
		name: "Gourmet Race",
		players: "10 players",
		desc: "A mad dash inspired by Kirby Super Star. Race to the finish and eat as much food as you can along the way. Some maps hide secret passages, if you can find them.",
		banner: "/img/gmt/banners/gourmetrace.jpg",
		logo: null,
		maps: maps.gourmetrace,
	},
];
