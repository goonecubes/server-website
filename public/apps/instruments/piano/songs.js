// Piano sheet music. Melodies only, all public domain, written as note names (C4 = middle C,
// sharps with #). "-" is a short pause and "|" starts a new line. The page converts notes to
// the keys of whichever piano mode is open, moving a song up or down if it doesn't fit.
var PIANO_SONGS = [
	{ title: "Twinkle Twinkle Little Star", notes:
		"C4 C4 G4 G4 A4 A4 G4 - F4 F4 E4 E4 D4 D4 C4 | G4 G4 F4 F4 E4 E4 D4 - G4 G4 F4 F4 E4 E4 D4 | C4 C4 G4 G4 A4 A4 G4 - F4 F4 E4 E4 D4 D4 C4" },
	{ title: "Mary Had a Little Lamb", notes:
		"E4 D4 C4 D4 E4 E4 E4 - D4 D4 D4 - E4 G4 G4 | E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4" },
	{ title: "Row, Row, Row Your Boat", notes:
		"C4 C4 C4 D4 E4 - E4 D4 E4 F4 G4 | C5 C5 C5 G4 G4 G4 E4 E4 E4 C4 C4 C4 | G4 F4 E4 D4 C4" },
	{ title: "Happy Birthday", notes:
		"C4 C4 D4 C4 F4 E4 - C4 C4 D4 C4 G4 F4 | C4 C4 C5 A4 F4 E4 D4 - A#4 A#4 A4 F4 G4 F4" },
	{ title: "Ode to Joy", notes:
		"E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4 | E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4 | D4 D4 E4 C4 D4 E4 F4 E4 C4 D4 E4 F4 E4 D4 C4 D4 - | E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4" },
	{ title: "Jingle Bells", notes:
		"E4 E4 E4 - E4 E4 E4 - E4 G4 C4 D4 E4 | F4 F4 F4 F4 F4 E4 E4 E4 E4 D4 D4 E4 D4 - G4 | E4 E4 E4 - E4 E4 E4 - E4 G4 C4 D4 E4 | F4 F4 F4 F4 F4 E4 E4 E4 G4 G4 F4 D4 C4" },
	{ title: "When the Saints Go Marching In", notes:
		"C4 E4 F4 G4 - C4 E4 F4 G4 - C4 E4 F4 G4 E4 C4 E4 D4 | E4 E4 D4 C4 C4 E4 G4 G4 G4 F4 | E4 F4 G4 E4 C4 D4 C4" },
	{ title: "Amazing Grace", notes:
		"C4 F4 A4 F4 A4 G4 F4 D4 C4 | C4 F4 A4 F4 A4 G4 C5 | A4 C5 A4 C5 A4 F4 C4 D4 F4 F4 D4 C4 | C4 F4 A4 F4 A4 G4 F4" },
	{ title: "Greensleeves", notes:
		"A4 C5 D5 E5 F5 E5 D5 B4 G4 A4 B4 C5 A4 A4 G#4 A4 B4 G#4 E4 | A4 C5 D5 E5 F5 E5 D5 B4 G4 A4 B4 C5 B4 A4 G#4 F#4 G#4 A4 A4" },
	{ title: "Korobeiniki (the Tetris song)", notes:
		"E5 B4 C5 D5 C5 B4 A4 - A4 C5 E5 D5 C5 B4 - C5 D5 E5 C5 A4 A4 | D5 F5 A5 G5 F5 E5 - C5 E5 D5 C5 B4 - B4 C5 D5 E5 C5 A4 A4" },
	{ title: "Für Elise", notes:
		"E5 D#5 E5 D#5 E5 B4 D5 C5 A4 - C4 E4 A4 B4 - E4 G#4 B4 C5 | E4 E5 D#5 E5 D#5 E5 B4 D5 C5 A4 - C4 E4 A4 B4 - E4 C5 B4 A4" },
	{ title: "Minuet in G", notes:
		"D5 G4 A4 B4 C5 D5 G4 G4 | E5 C5 D5 E5 F#5 G5 G4 G4 | C5 D5 C5 B4 A4 B4 C5 B4 A4 G4 | F#4 G4 A4 B4 G4 B4 A4" },
	{ title: "Canon in D", notes:
		"F#5 E5 D5 C#5 B4 A4 B4 C#5 | D5 C#5 B4 A4 G4 F#4 G4 E4 | D4 F#4 A4 G4 F#4 D4 F#4 E4 | D4 B3 D4 A4 G4 B4 A4 G4" }
];
