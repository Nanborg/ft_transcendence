// WHY: Rate limit protects auth and API routes from repeated automated requests
// DECISION: Limit is shared here so routes do not duplicate throttling config
const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	
	handler: (req, res, next, options) =>
	{
		const resetTime = Math.floor(Date.now() / 1000) + (options.windowMs / 1000);
		
		res.status(429);
		res.set('Retry-After', String(options.windowMs / 1000));
		res.set('X-RateLimit-Limit', String(options.max));
		res.set('X-RateLimit-Remaining', '0');
		res.set('X-RateLimit-Reset', String(resetTime));
		
		res.json(
		{
			error: 'Too many login attempts',
			message: 'Please wait before trying again',
			retryAfter: options.windowMs / 1000
		});
	},
	
	standardHeaders: true,
	legacyHeaders: false,



});
module.exports = loginLimiter;
// WHY: Login rate limit slows brute-force attempts before auth logic runs
