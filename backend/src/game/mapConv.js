const fs = require('fs');

'use strict';
// '.' (floor) is not as game engine don't want them (see IGNORED_CHARS below).
const CHAR_CONFIG = {
	'#': { typeId: 2, state: { blocking: true } },
	B: { typeId: 109, state: { blocking: true } },
	C: { typeId: 300, state: { blocking: true } },
	S: { typeId: 301, state: { blocking: false } },

	'1': { typeId: 100, state: { blocking: true } },
	'2': { typeId: 101, state: { blocking: true } },
	'3': { typeId: 103, state: { blocking: false } },
};

// Characters that are just terrain and should never become entities.
const IGNORED_CHARS = new Set(['.']);

// Reads map file and converts the entities to the JSON format.
function mapConv(filePath, roomId) {
	const raw = fs.readFileSync(filePath, 'utf8');
	const lines = raw.split(/\r?\n/);

	// Everything before the "Seed:" line is the grid. Metadata comes after a blank line at the end of the file.
	const seedLineIdx = lines.findIndex((l) => l.trim().startsWith('Seed:'));
	const gridLines = (seedLineIdx === -1 ? lines : lines.slice(0, seedLineIdx)).filter((l) => l.trim().length > 0);

	const entities = [];
	const unknownChars = new Set();

	const SCALE = Math.floor((2 ** 31) / gridLines[0].length);
	// const SCALE = 1;
	gridLines.forEach((line, row) => {

		// (x, y) -> (col*SCALE, row*SCALE).
		for (let col = 0; col < line.length; col++)
		{
			const ch = line[col];
			if (IGNORED_CHARS.has(ch))
				continue;

			const config = CHAR_CONFIG[ch];
			if (!config)
			{
				unknownChars.add(ch);
				continue; // unknown characters are skipped
			}

			entities.push({
				typeId: config.typeId,
				posX: col * SCALE,
				posY: row * SCALE,
				velX: 0,
				velY: 0,
				state: { ...config.state },
			});
		}
	});

	if (unknownChars.size > 0)
		console.warn(`Warning: found unknown characters (skipped): ${[...unknownChars].join(', ')}`);

	return {
	roomId: roomId,
	scale: SCALE,
	entities,
  };

}

module.exports = { mapConv };
