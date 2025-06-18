import { createSessionClient, SESSION_COOKIE } from '$lib/server/appwrite.ts';
import { redirect } from '@sveltejs/kit';

export const actions = {
	logout: async (event) => {
		// Create the Appwrite client.
		const { account } = createSessionClient(event);

		// Delete the session on Appwrite, and delete the session cookie.
		await account.deleteSession('current');
		event.cookies.delete(SESSION_COOKIE, { path: '/' });

		// Redirect to the sign up page.
		redirect(302, '/login');
	}
};
