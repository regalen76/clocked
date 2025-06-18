import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types.d.ts';
import { createAdminClient, SESSION_COOKIE } from '$lib/server/appwrite.ts';
import { ID } from 'node-appwrite';

const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	action: z.enum(['login', 'register'])
});

export const load: PageServerLoad = async ({ locals }) => {
	return {
		form: await superValidate(zod(loginSchema)),
		loggedInUser: locals.user
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const { account } = createAdminClient();

		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password, action } = form.data;

		try {
			if (action === 'register') {
				// Create new account
				await account.create(ID.unique(), email, password);
				// Automatically log in after registration
				const session = await account.createEmailPasswordSession(email, password);
				cookies.set(SESSION_COOKIE, session.secret, {
					sameSite: 'strict',
					expires: new Date(session.expire),
					secure: true,
					path: '/'
				});
			} else if (action === 'login') {
				// Login with existing account
				const session = await account.createEmailPasswordSession(email, password);
				cookies.set(SESSION_COOKIE, session.secret, {
					sameSite: 'strict',
					expires: new Date(session.expire),
					secure: true,
					path: '/'
				});
			}

			// Redirect to dashboard or home page after successful auth
			redirect(301, '/dashboard');
		} catch (error: any) {
			if (isRedirect(error)) throw error;

			console.error('Authentication error:', error);

			// Handle specific Appwrite errors
			let errorMessage = 'An error occurred during authentication';

			if (error.code === 401) {
				errorMessage = 'Invalid email or password';
			} else if (error.code === 409) {
				errorMessage = 'User with this email already exists';
			} else if (error.message) {
				errorMessage = error.message;
			}

			return message(form, errorMessage, { status: 400 });
		}
	}
};
