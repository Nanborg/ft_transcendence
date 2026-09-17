// WHY: Sanitizer keeps user-provided text safe before storing or rendering
// SAFETY: Empty tag and attribute allowlists strip markup instead of trying to trust it
// DECISION: Sanitizing stays server-side so every route receives the same protection
const sanitizeHtml = require('sanitize-html');

function cleanInput(text)
{
	if (typeof text !== 'string')
		return text;

	return sanitizeHtml(text, {allowedTags: [], allowedAttributes: {}, });
}

module.exports = { cleanInput };
