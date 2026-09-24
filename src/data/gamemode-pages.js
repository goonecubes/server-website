// Individual gamemode pages (/gamemodes/<id>/<tab>/).
// Layout and tab structure follow the original gmtower.org gamemode pages; the text is rewritten,
// and facts are updated for this server:
//  - player counts: gmodtower/gamemode/base/multiserver/gamemodes/*.lua
//  - GMC payouts:   <gamemode>/gamemode/gmt/sh_payout.lua
//  - milestones:    loadables/achievement/achievements/milestones.lua
//  - map lists:     maps.json (server map registry) + the loading screen's map info
// Images under /img/gmtower/ are the original gmtower.org artwork (see tools/, archive.org copies).
import fs from "node:fs";
import path from "node:path";
import maps from "./maps.json";

const PUBLIC = path.resolve("public");
// Only reference images that were actually recovered from the archive.
const img = (p) => (p && fs.existsSync(path.join(PUBLIC, p)) ? p : null);
const bg = (gm, tab) => img(`/img/gmtower/gamemodes/backgrounds/${gm}/${tab}.jpg`);
const icon = (gm, file) => img(`/img/gmtower/gamemodes/icons/${gm}/${file}`);

// Map author + description, as shown on the in-game loading screen.
const loadingMaps = (() => {
	const js = fs.readFileSync(path.join(PUBLIC, "loading", "data.js"), "utf8");
	return JSON.parse(js.slice(js.indexOf("{"), js.lastIndexOf("}") + 1)).maps;
})();
function mapInfo(id) {
	let best = null;
	for (const key of Object.keys(loadingMaps)) {
		if (id.startsWith(key) && (!best || key.length > best.length)) best = key;
	}
	return best ? loadingMaps[best] : {};
}
function mapList(registry, extra = {}) {
	return (maps[registry] || []).map((m) => {
		const info = mapInfo(m.id);
		return { name: m.name, image: m.image, author: info.author || "", desc: info.desc || "", ...(extra[m.name] || {}) };
	});
}

const gmc = (n) => `${n.toLocaleString("en-US")} GMC`;

export const pages = [
	{
		id: "lobby",
		name: "Lobby",
		theme: { bg: "#0a3447", border: "#3aa0e8" },
		stats: [["Map", "Lobby 2"], ["Players", "Everyone"], ["Mood", "Relaxed"], ["Mic Support", "Yes"]],
		tabs: [
			{
				id: "overview", label: "Lobby", bg: bg("lobby", "lobby"),
				tagline: "Your home among the clouds.",
				sections: [
					["The heart of the tower", "Every visit starts in the Lobby, and it's the only place connected to everything else. Skyline Tower runs Lobby 2: a much bigger lobby than the original, with a transit station, a central plaza, shops, a casino, a nightclub, a theater, a boardwalk with a pool and waterslides, and the condo tower rising above it all."],
					["Getting around", "A monorail loops around the lobby with a guided tour along the way, and the tower elevators carry you from the ground floor up to the Tower Condos. Map boards around the lobby show where everything is if you get lost."],
					["Always something going on", "Lobby events start every 15 to 25 minutes, the merchant wanders between spots with rare items, and the big screen in the Transit Station shows the latest changes to the server. When you're ready for something bigger, step into a game port."],
				],
			},
			{
				id: "condos", label: "Condos", bg: bg("lobby", "suites"),
				tagline: "A place of your own.",
				sections: [
					["Check in", "Take the elevator up to the Tower Condos and talk to the receptionist to check into a condo. It's yours while you're in the condo area, and everything you place is saved to your account, so it comes back exactly as you left it next time you check in."],
					["Make it yours", "Buy furniture, decorations, electronics and plants in the lobby stores, then place them anywhere in your condo. Move and rotate items to get the layout just right, and sell back anything you're tired of."],
					["CondOS", "Every condo has a CondOS control panel on the wall. Use it to play music, dim the lights and change their colour, open and close the blinds, switch the view outside your windows, lock your door and manage your guest list."],
					["Invite your friends", "Condos are made for hanging out. Invite friends over, watch videos together on your condo TV, or throw a party. Your bank vault keeps extra items safe, and the condo stays yours until you head back out of the condo area."],
				],
			},
			{
				id: "theater", label: "Theater", bg: bg("lobby", "theater"),
				tagline: "Grab some popcorn.",
				sections: [
					["Watch together", "The theater is the place to sit back and watch videos with everyone else. Anything that plays is synced for the whole room, so the whole audience laughs at the same moment."],
					["You pick what's next", "Request videos from the seats and they join the queue. Vote on what's playing to keep the good stuff on screen and skip what nobody wants to watch."],
				],
			},
			{
				id: "stores", label: "Stores", bg: bg("lobby", "stores"),
				tagline: "Spend that GMC.",
				sections: [
					["Shop around", "The lobby is packed with stores for spending the GMC you earn. Every shop has a search box, and a few items can be upgraded through several levels."],
					["Where to go", "Sweet Suite Furnishings for condo furniture, Central Circuit for electronics and appliances, Songbirds for music, The Toy Stop for toys and gadgets, Basical's Goods for everyday odds and ends, the Nature store for plants and rocks, and Tower Outfitters for player models, hats and accessories. Grab a drink at the Smoothie Bar while you're at it."],
					["The merchant", "A travelling merchant sets up shop in a different part of the lobby every 15 minutes with his own stock and his own music. Keep an eye out for him."],
				],
			},
			{
				id: "arcade", label: "Arcade & Casino", bg: bg("lobby", "arcade"),
				tagline: "Games inside the game.",
				sections: [
					["Blockles", "Stack falling blocks to clear rows and rack up points that turn into GMC. Controls use WASD or the arrow keys, with soft and hard drop, and the best scores go up on the leaderboard wall."],
					["Trivia", "Step up to a podium and take on other players in multiple-choice trivia on just about any subject. The quickest correct answers win."],
					["Tower Casino", "Try your luck at the slot machines, sit down for a hand of poker, or challenge someone to a duel. Win big, lose big, and try not to spend your whole condo budget."],
				],
			},
			{
				id: "ports", label: "Ports", bg: bg("lobby", "ports"),
				tagline: "Head out to play.",
				sections: [
					["Queue up", "Every gamemode has its own port in the lobby. Walk in to join its queue and carry on enjoying the lobby while you wait. Group up with friends to queue together."],
					["Vote and go", "When enough players are ready, everyone votes on a map and gets sent to the game server together. When the match ends, you're brought straight back to the lobby with the GMC you earned."],
				],
			},
			{
				id: "events", label: "Events", bg: bg("lobby", "minigames"),
				tagline: "Something new every few minutes.",
				sections: [
					["Lobby events", "Every 15 to 25 minutes a new event kicks off somewhere in the lobby. Head to the right spot, join in, and earn GMC for taking part. The HUD always shows what's coming up next."],
					["The rotation", "Store Sale (discounts across the shops), Chainsaw Battle, Fist Fight, Balloon Pop, Obama Smash and Snowball Fight. Around Halloween, Balloon Pop becomes Ghost Pop."],
				],
			},
		],
	},

	{
		id: "ballrace",
		name: "Ball Race",
		theme: { bg: "#603314", border: "#d59c73" },
		stats: [["Gameplay", "Physics-based puzzle"], ["Players", "8 players (3 needed)"], ["Flow", "One world, level by level"], ["Mood", "Happy"], ["Mic Support", "Yes"]],
		tabs: [
			{
				id: "overview", label: "Overview", bg: bg("ballrace", "ballrace"),
				tagline: "Roll around. Grab bananas. Master the orb.",
				sections: [
					["Life inside a ball", "Ball Race is all about having fun with physics. You're sealed inside an orb and roll your way through floating courses, collecting bananas as you go and racing to the goal."],
					["Unique puzzles", "Every world has its own theme and its own set of tricks. You'll face crushers, lasers, lava, falling objects, buttons to press, jumps to time and routes to memorise, and some puzzles need a bit of teamwork before the clock runs out."],
					["Easy to pick up", "Move with WASD and control the camera however you like, zoom included. Everything is built with new players in mind, so anyone can keep up with the pack."],
				],
			},
			{
				id: "maps", label: "Worlds", bg: bg("ballrace", "maps"), kind: "maps",
				maps: mapList("ballrace", {
					"Sky World": { facts: ["9 levels", "Easy", "Music: Minikon - Happiiendo"] },
					"Paradise": { facts: ["13 levels", "Easy", "Music: Hint - Quite Spectacular"] },
					"Grass World": { facts: ["8 levels", "Medium", "Music: World's End Girlfriend - I'm Flying"] },
					"Khromidro": { facts: ["11 levels", "Medium", "Music: Minikon - Cocoa Pal (Extended)"] },
					"Ice World": { facts: ["10 levels", "Medium", "Music: Waterflame - Surface"] },
					"Sand World": { facts: ["10 levels", "Medium", "Music: Kirby Air Ride - Sky Sands"] },
					"Memories": { facts: ["Hard", "Music: Ochre - 111"] },
				}),
			},
			{
				id: "obstacles", label: "Obstacles", bg: bg("ballrace", "obstacles"), kind: "cards",
				intro: "Obstacles are one piece of every Ball Race puzzle. Use them well and they're your best friend; ignore them and they'll send you off the edge.",
				cards: [
					{ title: "Crate", side: "First seen in Sky World", img: icon("ballrace", "obstacles_crate.jpg"), text: "A heavy box that takes some effort to shove around. Sometimes they drop from above." },
					{ title: "Bumpers", side: "First seen in Grass World", img: icon("ballrace", "obstacles_bumpers.jpg"), text: "Roll into one and it throws you back based on how fast you hit it. Even a gentle tap can bounce you all over the place." },
					{ title: "Rocks", side: "First seen in Grass World", img: icon("ballrace", "obstacles_rocks.jpg"), text: "Boulders tumble down from above and happily knock your orb off course." },
					{ title: "Chemicals", side: "First seen in Grass World", img: icon("ballrace", "obstacles_chemicals.jpg"), text: "Toxic goo that pops your orb on contact. Steer well clear." },
					{ title: "Repeller", side: "First seen in Memories", img: icon("ballrace", "obstacles_repeller.jpg"), text: "A magnetic pole that shoves your orb away. Handy for big jumps, but it pushes harder than any bumper." },
					{ title: "Attractor", side: "First seen in Memories", img: icon("ballrace", "obstacles_attractor.jpg"), text: "The repeller's opposite: it pulls your orb in. Get too close and you'll have a hard time escaping." },
					{ title: "Magical Block", side: "First seen in Memories", img: icon("ballrace", "obstacles_magical_block.jpg"), text: "Invisible until you roll close, which makes them sneaky when you're short on time." },
					{ title: "Explosive Crate", side: "First seen in Paradise", img: icon("ballrace", "obstacles_explosive_crate.jpg"), text: "Like a regular crate, except it goes boom." },
					{ title: "Windmill", side: "First seen in Khromidro", img: icon("ballrace", "obstacles_windmill.jpg"), text: "Spinning blades that swat you away if your timing is off." },
					{ title: "Black Goo", side: "Metal World", img: null, text: "Sticky puddles that slow your orb to a crawl until the effect wears off." },
					{ title: "Marbles", side: "Metal World", img: null, text: "They sit perfectly still until you get close, then ram you and roll back into place." },
				],
			},
			{
				id: "payout", label: "GMC Payout", bg: bg("ballrace", "payout"), kind: "payout",
				intro: "GMC is paid out at the end of every level.",
				payout: [
					["Thanks for playing", gmc(50)],
					["Completed the level", gmc(25)],
					["1st / 2nd / 3rd to finish", `${gmc(50)} / ${gmc(25)} / ${gmc(10)}`],
					["Bananas collected", "5 GMC each"],
					["Pressed a button (team player)", gmc(25)],
					["Didn't lose a life", gmc(10)],
				],
			},
			{
				id: "milestones", label: "Milestones", bg: bg("ballrace", "milestones"), kind: "cards",
				intro: "Milestones are exclusive lobby items you can only get by earning them in a gamemode. They're yours to keep forever.",
				cards: [
					{ title: "Ball Race Orb", side: "Milestone #1", img: icon("ballrace", "milestones_ball_race_orb.jpg"), text: "Play 300 levels of Ball Race to unlock an orb you can roll around the lobby in." },
					{ title: "Bumper", side: "Milestone #2", img: icon("ballrace", "milestones_bumper.jpg"), text: "Bump yourself 500 times in Ball Race to get your own bumper for the lobby." },
				],
			},
		],
	},

	{
		id: "virus",
		name: "Virus",
		theme: { bg: "#32541d", border: "#8fc45e" },
		stats: [["Gameplay", "First-person shooter"], ["Players", "12 players (4 needed)"], ["Flow", "Rounds"], ["Mood", "Tense"], ["Mic Support", "Yes"]],
		tabs: [
			{
				id: "overview", label: "Overview", bg: bg("virus", "virus"),
				tagline: "Shoot zombies. Become zombies.",
				sections: [
					["Nobody knows who's next", "Virus is inspired by the Virus mode from the TimeSplitters series. Everyone drops into the map as a survivor, and nobody knows who's carrying the infection until it breaks out. There's no jumping or crouching, so don't back yourself into a corner."],
					["Hold them off", "Just before the round starts, one player becomes patient zero. The virus only spreads by touch, so survivors have to keep the infected at bay with everything they've got until time runs out."],
					["Spread the infection", "As one of the infected, your job is to pass it on. Work together to corner the survivors, because they're armed and they will fight back."],
					["Last one standing", "Everyone else infected? You're the last survivor? Run. Really, really fast."],
				],
			},
			{ id: "maps", label: "Maps", bg: bg("virus", "maps"), kind: "maps", maps: mapList("virus") },
			{
				id: "weapons", label: "Weapons", bg: bg("virus", "weapons"), kind: "cards",
				intro: "Your loadout is randomised every time you spawn, so learn them all.",
				cards: [
					{ title: "Dual Silencers", side: "Pistols", img: icon("virus", "weapons_dual_silencers.jpg"), text: "Left click fires one pistol, right click fires the other. You can fire them as fast as you can click." },
					{ title: "9mm", side: "Pistol", img: icon("virus", "weapons_9mm.jpg"), text: "Hits a lot harder than it looks. A couple of shots will drop most infected." },
					{ title: "Flak Gun", side: "Pistol", img: icon("virus", "weapons_flak_gun.jpg"), text: "A ridiculously powerful burst of flak with a wide spread and only a few shots, so make each one count." },
					{ title: "Sci-Fi Handgun", side: "Pistol", img: icon("virus", "weapons_sci-fi_handgun.jpg"), text: "Fires lasers that bounce off walls, just like in the movies." },
					{ title: "Tommy Gun", side: "Automatic", img: icon("virus", "weapons_tommy_gun.jpg"), text: "Old-school rapid fire for holding a corridor." },
					{ title: "Plasma AutoRifle", side: "Automatic", img: icon("virus", "weapons_plasma_autorifle.jpg"), text: "Fires bursts of plasma and recharges on its own." },
					{ title: "RCP-120", side: "Automatic", img: icon("virus", "weapons_rcp-120.jpg"), text: "A rapid-fire rifle with a zoom for picking off infected at range." },
					{ title: "Double Barrel Shotgun", side: "Shotgun", img: icon("virus", "weapons_double_barrel_shotgun.jpg"), text: "Two barrels, huge stopping power, slow reload." },
					{ title: "Sonic Shotgun", side: "Shotgun", img: icon("virus", "weapons_sonic_shotgun.jpg"), text: "A normal shotgun blast on left click; hold right click to charge a shot that sends infected flying." },
					{ title: "Adrenaline", side: "Equipment", img: icon("virus", "weapons_adrenaline.jpg"), text: "Press C for a quick burst of speed when the infected get too close." },
					{ title: "Sniper Rifle", side: "Rifle", img: icon("virus", "weapons_sniper_rifle.jpg"), text: "Point, click, and one less infected to worry about." },
					{ title: "TNT", side: "Explosive", img: icon("virus", "weapons_tnt.jpg"), text: "Throw it down and it detonates when an infected wanders too close." },
				],
			},
			{
				id: "payout", label: "GMC Payout", bg: bg("virus", "payout"), kind: "payout",
				intro: "GMC is paid out at the end of every round.",
				payout: [
					["Thanks for playing", gmc(50)],
					["Survived the infection", gmc(50)],
					["Last survivor", gmc(100)],
					["Survived with 3+ other survivors", gmc(25)],
					["Patient zero who spread the virus", gmc(50)],
					["Helped spread the infection", gmc(25)],
					["Kills", "5 GMC each"],
					["Top 3 killers", `${gmc(50)} / ${gmc(25)} / ${gmc(10)}`],
				],
			},
			{
				id: "milestones", label: "Milestones", bg: bg("virus", "milestones"), kind: "cards",
				intro: "Earn these in Virus and use them in the lobby.",
				cards: [
					{ title: "Virus Flame", side: "Milestone #1", img: null, text: "Play 250 rounds of Virus to get the collectable virus flame." },
					{ title: "Adrenaline", side: "Milestone #2", img: null, text: "Use adrenaline 80 times to get your own unlimited-use Adrenaline." },
					{ title: "Virus Radar", side: "Milestone #3", img: null, text: "Survive as the last survivor 25 times to earn the Virus Radar." },
				],
			},
		],
	},

	{
		id: "pvpbattle",
		name: "PVP Battle",
		theme: { bg: "#8f050f", border: "#f07c56" },
		stats: [["Gameplay", "First-person shooter"], ["Players", "8 players (4 needed)"], ["Flow", "Short rounds"], ["Mood", "Hyperactive"], ["Mic Support", "Yes"]],
		tabs: [
			{
				id: "overview", label: "Overview", bg: bg("pvpbattle", "pvpbattle"),
				tagline: "Deathmatch carnage at its finest.",
				sections: [
					["Pure chaos", "PVP Battle is a fast, loud deathmatch inspired by the Half-Life 2 mod Jaykin' Bacon: Source. Hand everyone a pile of ridiculous weapons, sprinkle in pop-culture references, and let them loose."],
					["Fast-paced action", "Rounds are short, so make every second count. You move faster than in most shooters and can double jump, at least until you grab a power-up."],
					["Weapons galore", "This isn't a game for careful tacticians. There are around 20 weapons, each with a counter, so skill decides the winner, not your loadout."],
					["Surreal battlefields", "Fight in the snow, in a meadow of flowers, on a container ship, on Mars, or out in deep space."],
					["Power-ups", "Temporary power-ups give you ridiculous abilities and their own theme music. Everyone will be fighting over them."],
				],
			},
			{ id: "maps", label: "Battlefields", bg: bg("pvpbattle", "maps"), kind: "maps", maps: mapList("pvpbattle") },
			{
				id: "payout", label: "GMC Payout", bg: bg("pvpbattle", "payout"), kind: "payout",
				intro: "GMC is paid out at the end of every match.",
				payout: [
					["Thanks for playing", gmc(100)],
					["Kills", "10 GMC each"],
					["Headshot kills", "5 GMC each (extra)"],
					["Top 3 killers", `${gmc(100)} / ${gmc(50)} / ${gmc(25)}`],
				],
			},
			{
				id: "milestones", label: "Milestones", bg: bg("pvpbattle", "milestones"), kind: "cards",
				intro: "Earn these in PVP Battle and use them in the lobby.",
				cards: [
					{ title: "Stealth Box", side: "Milestone #1", img: null, text: "Play 50 rounds of PVP Battle." },
					{ title: "Take On Ball", side: "Milestone #2", img: null, text: "Get 100 kills while using any power-up." },
					{ title: "Jumper Super Shotty", side: "Milestone #3", img: null, text: "Get 80 kills while airborne." },
				],
			},
		],
	},

	{
		id: "uch",
		name: "Ultimate Chimera Hunt",
		theme: { bg: "#b5115d", border: "#f58ac0" },
		stats: [["Gameplay", "One vs. all"], ["Players", "11 players (6 needed)"], ["Flow", "Rounds"], ["Mood", "Comical"], ["Mic Support", "Yes"]],
		tabs: [
			{
				id: "overview", label: "Overview", bg: bg("uch", "uch"),
				tagline: "Porky needs you!",
				sections: [
					["A MOTHER 3 fan game", "Ultimate Chimera Hunt is based on the Chimera Lab from MOTHER 3. The original gamemode was made by Aska and Fluxmage."],
					["The Pigmasks", "Each round one player becomes the Ultimate Chimera and everyone else joins the Pigmask army. The Chimera has a conveniently placed off switch on its back: sneak up and press it, or hit the Chimera with Mr. Saturn, to win. Whoever takes it down gets promoted for the next round."],
					["The Ultimate Chimera", "As the Chimera, your job is to eat every Pigmask in sight. Bite them, swipe them off your back with your tail, leap up and flatten them, or roar to scare everyone nearby."],
					["Ghosts", "Getting eaten isn't the end. You come back as a ghost to watch the rest of the round, and some lucky ghosts even get a fancy wine glass."],
				],
			},
			{ id: "maps", label: "Maps", bg: bg("uch", "maps"), kind: "maps", maps: mapList("ultimatechimerahunt") },
			{
				id: "payout", label: "GMC Payout", bg: bg("uch", "payout"), kind: "payout",
				intro: "GMC is paid out at the end of every round.",
				payout: [
					["Thanks for playing", gmc(25)],
					["Your team won", `${gmc(25)} (${gmc(10)} as a ghost)`],
					["Pressed the Chimera's button", gmc(50)],
					["Took down the Chimera with Mr. Saturn", gmc(75)],
					["Won as the Ultimate Chimera", gmc(100)],
					["Rank bonus for surviving (Ensign to Colonel)", "20 to 50 GMC"],
					["Chimera: eating ranked Pigmasks", "20 to 50 GMC each"],
					["Chimera: every Pigmask eaten", "15 GMC each"],
					["Last Pigmask standing", gmc(100)],
				],
			},
			{
				id: "milestones", label: "Milestones", bg: bg("uch", "milestones"), kind: "cards",
				intro: "Earn these in Ultimate Chimera Hunt.",
				cards: [
					{ title: "Colonel Pigmask", side: "Milestone #1", img: null, text: "Play 200 rounds of UCH to be able to become a Colonel Pigmask in the lobby." },
					{ title: "Ghost", side: "Milestone #2", img: null, text: "Play 500 rounds of UCH to be able to become a ghost in the lobby." },
					{ title: "Ultimate Chimera Pet", side: "Milestone #3", img: null, text: "Press the button on the Chimera 150 times to get your own Chimera pet." },
				],
			},
		],
	},

	{
		id: "zombiemassacre",
		name: "Zombie Massacre",
		theme: { bg: "#800203", border: "#e05a4a" },
		stats: [["Gameplay", "Top-down shooter"], ["Players", "6 players (3 needed)"], ["Flow", "Days, then a boss"], ["Mood", "Intense"], ["Mic Support", "Yes"]],
		tabs: [
			{
				id: "overview", label: "Overview", bg: bg("zombiemassacre", "zombiemassacre"),
				tagline: "Massacre hundreds of zombies.",
				sections: [
					["Retro, with a twist", "Zombie Massacre is a co-op, top-down zombie shooter that throws back to arcade classics. Hold off the horde across different maps and kill as many as you can along the way."],
					["Arcade madness", "Shoot until you're dry, then grab new weapons from the pickups zombies drop. Collect coins, power up, place your class equipment and chain kills into combos for more points."],
					["Weapons galore", "Magnums, flamethrowers, rocket launchers, chainsaws, baseball bats and plenty more are waiting to be picked up."],
					["Map scenarios", "Power generators, open doors, solve co-op puzzles and fight bosses, moving from one safe point to the next."],
					["So many zombies", "Dozens of zombies can be on screen at once, and every day the waves get tougher."],
				],
			},
			{
				id: "classes", label: "Classes", bg: bg("zombiemassacre", "classes"), kind: "cards",
				intro: "Pick one of five classes. Kill 5 zombies in a row to trigger your combo power, and right click to use your equipment.",
				cards: [
					{ title: "Doctor", side: "Transplant / Healing Kit", img: null, text: "Not exactly licensed, but it works. The combo power drains health from zombies and gives it to teammates, and the healing kit patches up everyone nearby." },
					{ title: "Electrician", side: "Tesla Zap / Homemade Turret", img: null, text: "An inventor on the side. The combo power shocks every zombie in range, and a scrap-metal turret pops up to lock down an area." },
					{ title: "Journalist", side: "Camera Flash / Radio Tower", img: null, text: "Always chasing the story. The camera flash damages everything around you, and the radio tower's frequency makes zombie heads pop." },
					{ title: "Mercenary", side: "A.L.P.S. / Focus", img: null, text: "A professional with a steady trigger finger. The combo power fires precision lasers at nearby targets, and Focus lets you aim and shoot without thinking." },
					{ title: "Survivor", side: "Ramming Shield / Blade Trap", img: null, text: "Prepared for this for years. Charge through the horde behind a shield, and set a blade trap that sucks in anything that gets too close." },
				],
			},
			{
				id: "enemies", label: "Enemies", bg: bg("zombiemassacre", "enemies"), kind: "cards",
				intro: "Know what's coming for you.",
				cards: [
					{ title: "Zombie", side: "", img: null, text: "Your standard shambling horde." },
					{ title: "Zombdog", side: "", img: null, text: "A rotting, furious undead dog. Fast and nasty." },
					{ title: "Crimson", side: "", img: null, text: "A zombie that's on fire, and happy to set you on fire too." },
					{ title: "Mutant", side: "", img: null, text: "A huge mass of mutated flesh. Keep your distance." },
				],
			},
			{ id: "maps", label: "Maps", bg: bg("zombiemassacre", "maps"), kind: "maps", maps: mapList("zombiemassacre") },
			{
				id: "payout", label: "GMC Payout", bg: bg("zombiemassacre", "payout"), kind: "payout",
				intro: "GMC is paid out at the end of the game.",
				payout: [
					["Thanks for playing", gmc(50)],
					["Points earned", "Converted into bonus GMC"],
					["Defeated the boss", gmc(150)],
					["Most / 2nd / 3rd most boss damage", `${gmc(200)} / ${gmc(125)} / ${gmc(50)}`],
				],
			},
			{
				id: "milestones", label: "Milestones", bg: bg("zombiemassacre", "milestones"), kind: "cards",
				intro: "Earn this in Zombie Massacre.",
				cards: [
					{ title: "Helicopter Companion", side: "Milestone #1", img: null, text: "Survive 90 days to earn a helicopter that follows you around the lobby." },
				],
			},
		],
	},

	{
		id: "minigolf",
		name: "Minigolf",
		theme: { bg: "#4d9124", border: "#a6e07a" },
		stats: [["Gameplay", "Miniature golf"], ["Players", "12 players (3 needed)"], ["Flow", "18 holes"], ["Mood", "Relaxing"], ["Mic Support", "Yes"]],
		tabs: [
			{
				id: "overview", label: "Overview", bg: bg("minigolf", "minigolf"),
				tagline: "Relax.",
				sections: [
					["Take it easy", "Minigolf is the most laid-back gamemode in the tower. Listen to the waves and the birds while everyone lines up their putts."],
					["Go for par", "It plays just like real minigolf: get the ball in the hole in as few strokes as you can."],
					["Birdies and beyond", "One under par is a birdie, two under an eagle, three under an albatross and four under a condor. And a hole in one is always worth celebrating."],
				],
			},
			{ id: "maps", label: "Maps", bg: bg("minigolf", "maps"), kind: "maps", maps: mapList("minigolf") },
			{
				id: "payout", label: "GMC Payout", bg: bg("minigolf", "payout"), kind: "payout",
				intro: "GMC is paid out for every hole based on your score.",
				payout: [
					["Thanks for playing", gmc(25)],
					["Hole in one", gmc(150)],
					["Condor (4 under par)", gmc(140)],
					["Albatross (3 under)", gmc(130)],
					["Eagle (2 under)", gmc(120)],
					["Birdie (1 under)", gmc(110)],
					["Par", gmc(100)],
					["Bogey (1 over)", gmc(50)],
					["Double bogey (2 over)", gmc(25)],
					["Anything worse", gmc(10)],
				],
			},
			{
				id: "milestones", label: "Milestones", bg: bg("minigolf", "milestones"), kind: "cards",
				intro: "Earn this in Minigolf.",
				cards: [
					{ title: "Golf Ball", side: "Milestone #1", img: null, text: "Play 500 holes to get a golf ball you can use in the lobby." },
				],
			},
		],
	},

	{
		id: "sourcekarts",
		name: "Source Karts",
		theme: { bg: "#1f2a44", border: "#ffd400" },
		stats: [["Gameplay", "Kart racing"], ["Players", "6 players (3 needed)"], ["Flow", "Races"], ["Mood", "Competitive"], ["Mic Support", "Yes"]],
		tabs: [
			{
				id: "overview", label: "Overview", bg: bg("sourcekarts", "sourcekarts"),
				tagline: "Kart racing, tower style.",
				sections: [
					["Start your engines", "Source Karts is kart racing with items. Drift through corners, hit the boosts, and use whatever you pick up to knock your friends out of the lead."],
					["In production", "Source Karts is still being restored and may show up for testing before its full release."],
				],
			},
			{ id: "maps", label: "Tracks", bg: bg("sourcekarts", "maps"), kind: "maps", maps: mapList("sourcekarts") },
			{
				id: "payout", label: "GMC Payout", bg: bg("sourcekarts", "payout"), kind: "payout",
				intro: "GMC is paid out at the end of every race.",
				payout: [
					["Thanks for playing", gmc(100)],
					["Crossed the finish line", gmc(50)],
					["Gold / Silver / Bronze", `${gmc(250)} / ${gmc(200)} / ${gmc(150)}`],
					["Top 3 combatants", `${gmc(100)} / ${gmc(75)} / ${gmc(50)}`],
				],
			},
		],
	},

	{
		id: "gourmetrace",
		name: "Gourmet Race",
		theme: { bg: "#b04a1a", border: "#ffcf3f" },
		stats: [["Gameplay", "Platform race"], ["Players", "10 players"], ["Flow", "Races"], ["Mood", "Silly"], ["Mic Support", "Yes"]],
		tabs: [
			{
				id: "overview", label: "Overview", bg: null,
				tagline: "Race to the finish. Eat everything.",
				sections: [
					["A mad dash", "Inspired by Kirby Super Star, Gourmet Race is a sprint to the finish where you eat as much food as you can along the way."],
					["Secret routes", "Some maps hide secret passages. Find them and leave everyone else behind."],
					["In production", "Gourmet Race is still being restored and may show up for testing before its full release."],
				],
			},
			{ id: "maps", label: "Maps", bg: null, kind: "maps", maps: mapList("gourmetrace") },
			{
				id: "payout", label: "GMC Payout", bg: null, kind: "payout",
				intro: "GMC is paid out at the end of every race.",
				payout: [
					["Thanks for playing", gmc(25)],
					["Finished the race", gmc(50)],
					["1st / 2nd / 3rd", `${gmc(150)} / ${gmc(125)} / ${gmc(100)}`],
					["Food collected", "5 GMC each (up to 25 GMC)"],
				],
			},
		],
	},
];

// Tabs whose original background was never archived fall back to the gamemode's main
// background, or, for gamemodes with none, a large screenshot of one of their maps.
const heroFallback = {
	pvpbattle: "/loading/maps/gmt_pvp_meadow.jpg",
	sourcekarts: "/loading/maps/gmt_sk_lifelessraceway.jpg",
	gourmetrace: "/loading/maps/gmt_gr_nile.jpg",
};
for (const page of pages) {
	const main = page.tabs[0].bg || img(heroFallback[page.id]);
	for (const tab of page.tabs) tab.bg = tab.bg || main;
}

export const pageById = Object.fromEntries(pages.map((p) => [p.id, p]));
