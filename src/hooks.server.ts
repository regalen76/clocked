import { createSessionClient } from '$lib/server/appwrite.ts';

export async function handle({ event, resolve }) {
	try {
		// Use our helper function to create the Appwrite client.
		const { account } = createSessionClient(event);
		// Store the current logged in user in locals,
		// for easy access in our other routes.
		event.locals.user = await account.get();
	} catch {}

	// Continue with the request.
	return resolve(event);
}
