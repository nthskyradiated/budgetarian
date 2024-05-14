import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';

function createRateLimiter(cookieName: string, cookieSecret: string) {
	return new RetryAfterRateLimiter({
		// A rate is defined as [number, unit]
		IP: [10, 'h'], // IP address limiter, allowing up to  10 requests per hour
		IPUA: [5, 'm'], // IP + User Agent limiter, allowing up to  5 requests per minute

		cookie: {
			/* Cookie limiter. This limits the number of requests from the same browser (identified by a unique cookie) to  2 per minute.

			It helps prevent a single browser session from making too many requests in a short time, providing an extra layer of protection against abuse.
		*/
			name: cookieName, // Unique cookie name for this limiter
			secret: cookieSecret,
			rate: [2, 'm'], // Allows up to  2 requests per minute from the same browser session
			preflight: true // Require preflight call (see load function)
		}
	});
}
export const verifyCodeRateLimiter = createRateLimiter(
	'verifyCodeRateLimiterCookieId',
	'verifyCodeRateLimiterCookieSecret'
);
export const sendCodeRateLimiter = createRateLimiter(
	'sendCodeRateLimiterCookieId',
	'sendCodeRateLimiterCookieSecret'
);

export const passwordResetEmailRateLimiter = createRateLimiter(
	'passwordResetEmailRateLimiterCookieId',
	'passwordResetEmailRateLimiterCookieSecret'
);

export const passwordResetPageActionRateLimiter = createRateLimiter(
	'passwordResetPageActionRateLimiterCookieId',
	'passwordResetPageActionRateLimiterCookieSecret'
);

export const passwordResetDashboardPageActionRateLimiter = createRateLimiter(
	'passwordResetDashboardPageActionRateLimiterCookieId',
	'passwordResetDashboardPageActionRateLimiterCookieSecret'
);
