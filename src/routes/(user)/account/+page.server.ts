import { fail, redirect, type ServerLoadEvent } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { createSessionClient } from '$lib/server/appwrite.js';
import type { PageServerLoad, Actions } from './$types.js';

// Validation schema
const profileSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
	email: z.string().email('Please enter a valid email address'),
	phone: z
		.string()
		.optional()
		.refine((phone) => {
			if (!phone) return true;
			// Basic phone validation - adjust regex as needed
			return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
		}, 'Please enter a valid phone number')
});

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	// Logged out users can't access this page
	if (!event.locals.user) redirect(302, '/login');

	try {
		// Get current user data from locals
		const user = event.locals.user;

		// Initialize form with current user data
		const form = await superValidate(
			{
				name: user.name || '',
				email: user.email || '',
				phone: user.phone || ''
			},
			zod(profileSchema)
		);

		return {
			form,
			user: {
				id: user.$id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				emailVerification: user.emailVerification,
				phoneVerification: user.phoneVerification
			}
		};
	} catch (error) {
		console.error('Error loading user data:', error);
		throw redirect(302, '/login');
	}
};

export const actions: Actions = {
	updateProfile: async (event) => {
		// Logged out users can't access this action
		if (!event.locals.user) redirect(302, '/login');

		const form = await superValidate(event.request, zod(profileSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Create the Appwrite client
			const { account } = createSessionClient(event);

			const { name, email, phone } = form.data;
			const currentUser = event.locals.user;

			// Update name
			if (name && name !== currentUser.name) {
				await account.updateName(name);
			}

			// Update email (this might require verification)
			if (email && email !== currentUser.email) {
				try {
					await account.updateEmail(email, 'current_password'); // You'll need to handle password
				} catch (emailError) {
					console.error('Email update error:', emailError);
					return fail(400, {
						form,
						error: 'Email update failed. You may need to verify your current password.'
					});
				}
			}

			// Update phone
			if (phone && phone !== currentUser.phone) {
				try {
					await account.updatePhone(phone, 'current_password'); // You'll need to handle password
				} catch (phoneError) {
					console.error('Phone update error:', phoneError);
					return fail(400, {
						form,
						error: 'Phone update failed. You may need to verify your current password.'
					});
				}
			}

			return {
				form,
				message: 'Profile updated successfully!'
			};
		} catch (error) {
			console.error('Profile update error:', error);
			return fail(500, {
				form,
				error: 'An error occurred while updating your profile. Please try again.'
			});
		}
	}
};
