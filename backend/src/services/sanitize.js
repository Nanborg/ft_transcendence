const sanitizeHtml = require('sanitize-html');

function cleanInput(text)
{
	if (typeof text !== 'string')
		return text;
	return sanitizeHtml(text, {
		allowedTags: [],
		allowedAttributes: {},
	});
}

module.exports = { cleanInput };