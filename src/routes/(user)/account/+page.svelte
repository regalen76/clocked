<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { Button } from '$lib/components/ui/button/index.ts';
	import { Input } from '$lib/components/ui/input/index.ts';
	import { Label } from '$lib/components/ui/label/index.ts';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.ts';
	import { Alert, AlertDescription } from '$lib/components/ui/alert/index.ts';
	import { Badge } from '$lib/components/ui/badge/index.ts';
	import Mail from '@lucide/svelte/icons/mail';
	import User from '@lucide/svelte/icons/user';
	import Phone from '@lucide/svelte/icons/phone';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import XCircle from '@lucide/svelte/icons/x-circle';
	import Edit from '@lucide/svelte/icons/edit';
	import Save from '@lucide/svelte/icons/save';
	import X from '@lucide/svelte/icons/x';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// Validation schema (must match server-side)
	const profileSchema = z.object({
		name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
		email: z.string().email('Please enter a valid email address'),
		phone: z
			.string()
			.optional()
			.refine((phone) => {
				if (!phone) return true;
				return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
			}, 'Please enter a valid phone number')
	});

	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		validators: zodClient(profileSchema),
		resetForm: false,
		invalidateAll: true,
		onUpdated: ({ form }) => {
			if (form.valid) {
				handleSubmitSuccess();
			}
		}
	});

	let isEditing = $state(false);
	let originalFormData = $state({ ...$form });

	function startEditing() {
		isEditing = true;
		originalFormData = { ...$form };
	}

	function cancelEditing() {
		isEditing = false;
		// Reset form to original values
		$form = { ...originalFormData };
	}

	function handleSubmitSuccess() {
		isEditing = false;
		originalFormData = { ...$form };
	}
</script>

<div class="container mx-auto max-w-2xl space-y-6 p-6">
	<div class="flex items-center space-x-2">
		<User class="h-8 w-8" />
		<div>
			<h1 class="text-3xl font-bold">Account Settings</h1>
			<p class="text-muted-foreground">Manage your profile information and preferences</p>
		</div>
	</div>

	{#if $message}
		<Alert>
			<CheckCircle class="h-4 w-4" />
			<AlertDescription>{$message}</AlertDescription>
		</Alert>
	{/if}

	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<div>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>Update your personal details below</CardDescription>
				</div>
				{#if !isEditing}
					<Button variant="outline" size="sm" onclick={startEditing}>
						<Edit class="mr-2 h-4 w-4" />
						Edit
					</Button>
				{/if}
			</div>
		</CardHeader>
		<CardContent class="space-y-6">
			<form method="POST" action="?/updateProfile" use:enhance>
				<div class="flex flex-col gap-4">
					<!-- User ID Display -->
					<div class="space-y-2">
						<Label class="text-muted-foreground text-sm font-medium">User ID</Label>
						<div class="bg-muted rounded-md px-3 py-2 font-mono text-sm">
							{data.user.id}
						</div>
					</div>

					<!-- Name Field -->
					<div class="space-y-2">
						<Label for="name" class="flex items-center space-x-2">
							<User class="h-4 w-4" />
							<span>Full Name</span>
						</Label>
						{#if isEditing}
							<Input
								id="name"
								name="name"
								type="text"
								bind:value={$form.name}
								class={$errors.name ? 'border-destructive' : ''}
								placeholder="Enter your full name"
							/>
							{#if $errors.name}
								<p class="text-destructive text-sm">{$errors.name}</p>
							{/if}
						{:else}
							<div class="bg-muted rounded-md px-3 py-2">
								{data.user.name || 'Not set'}
							</div>
						{/if}
					</div>

					<!-- Email Field -->
					<div class="space-y-2">
						<Label for="email" class="flex items-center space-x-2">
							<Mail class="h-4 w-4" />
							<span>Email Address</span>
							{#if data.user.emailVerification}
								<Badge variant="secondary" class="ml-2">
									<CheckCircle class="mr-1 h-3 w-3" />
									Verified
								</Badge>
							{:else}
								<Badge variant="destructive" class="ml-2">
									<XCircle class="mr-1 h-3 w-3" />
									Unverified
								</Badge>
							{/if}
						</Label>
						{#if isEditing}
							<Input
								id="email"
								name="email"
								type="email"
								bind:value={$form.email}
								class={$errors.email ? 'border-destructive' : ''}
								placeholder="Enter your email address"
							/>
							{#if $errors.email}
								<p class="text-destructive text-sm">{$errors.email}</p>
							{/if}
							{#if !data.user.emailVerification}
								<p class="text-muted-foreground text-sm">
									Changing your email may require verification
								</p>
							{/if}
						{:else}
							<div class="bg-muted rounded-md px-3 py-2">
								{data.user.email || 'Not set'}
							</div>
						{/if}
					</div>

					<!-- Phone Field -->
					<div class="space-y-2">
						<Label for="phone" class="flex items-center space-x-2">
							<Phone class="h-4 w-4" />
							<span>Phone Number</span>
							{#if data.user.phone}
								{#if data.user.phoneVerification}
									<Badge variant="secondary" class="ml-2">
										<CheckCircle class="mr-1 h-3 w-3" />
										Verified
									</Badge>
								{:else}
									<Badge variant="destructive" class="ml-2">
										<XCircle class="mr-1 h-3 w-3" />
										Unverified
									</Badge>
								{/if}
							{/if}
						</Label>
						{#if isEditing}
							<Input
								id="phone"
								name="phone"
								type="tel"
								bind:value={$form.phone}
								class={$errors.phone ? 'border-destructive' : ''}
								placeholder="Enter your phone number (optional)"
							/>
							{#if $errors.phone}
								<p class="text-destructive text-sm">{$errors.phone}</p>
							{/if}
						{:else}
							<div class="bg-muted rounded-md px-3 py-2">
								{data.user.phone || 'Not set'}
							</div>
						{/if}
					</div>

					<!-- Action Buttons -->
					{#if isEditing}
						<div class="flex space-x-3 pt-4">
							<Button type="submit" disabled={$submitting} class="flex-1">
								{#if $submitting}
									<div
										class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
									></div>
									Saving...
								{:else}
									<Save class="mr-2 h-4 w-4" />
									Save Changes
								{/if}
							</Button>
							<Button
								type="button"
								variant="outline"
								onclick={cancelEditing}
								disabled={$submitting}
							>
								<X class="mr-2 h-4 w-4" />
								Cancel
							</Button>
						</div>
					{/if}
				</div>
			</form>
		</CardContent>
	</Card>

	<!-- Additional Account Info -->
	<Card>
		<CardHeader>
			<CardTitle>Account Status</CardTitle>
			<CardDescription>Overview of your account verification status</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<Mail class="h-4 w-4" />
					<span>Email Verification</span>
				</div>
				{#if data.user.emailVerification}
					<Badge variant="secondary">
						<CheckCircle class="mr-1 h-3 w-3" />
						Verified
					</Badge>
				{:else}
					<Badge variant="destructive">
						<XCircle class="mr-1 h-3 w-3" />
						Unverified
					</Badge>
				{/if}
			</div>

			{#if data.user.phone}
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-2">
						<Phone class="h-4 w-4" />
						<span>Phone Verification</span>
					</div>
					{#if data.user.phoneVerification}
						<Badge variant="secondary">
							<CheckCircle class="mr-1 h-3 w-3" />
							Verified
						</Badge>
					{:else}
						<Badge variant="destructive">
							<XCircle class="mr-1 h-3 w-3" />
							Unverified
						</Badge>
					{/if}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
