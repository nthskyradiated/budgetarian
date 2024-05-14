import {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$env/static/private';
import { GitHub, Google } from 'arctic';
import { PUBLIC_URL } from '$env/static/public';

const redirectUrl = `${PUBLIC_URL}/auth/callback/google`;

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
export const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUrl);

export const github_oauth_state_cookieName = 'githubOauthState';
export const google_oauth_state_cookieName = 'googleOauthState';
export const google_oauth_code_verifier_cookieName = 'googleOauthCodeVerifier';
