import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user || null // Ensure it's always defined
	};
};
