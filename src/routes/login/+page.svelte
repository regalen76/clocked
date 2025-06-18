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
	import * as Alert from '$lib/components/ui/alert/index.ts';
	import { Separator } from '$lib/components/ui/separator/index.ts';
	import { Badge } from '$lib/components/ui/badge/index.ts';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import type { PageData } from './$types.d.ts';

	export let data: PageData;

	const loginSchema = z.object({
		email: z.string().email('Please enter a valid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters long'),
		action: z.enum(['login', 'register'])
	});

	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		validators: zodClient(loginSchema),
		resetForm: false
	});

	let isLogin = true;

	function toggleMode() {
		isLogin = !isLogin;
		$form.action = isLogin ? 'login' : 'register';
	}

	// Set initial action
	$form.action = 'login';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		{#if data.loggedInUser}
			<Card>
				<CardHeader>
					<CardTitle>Welcome back!</CardTitle>
					<CardDescription>You are currently logged in</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-center space-x-2">
						<Badge variant="secondary">Logged in as</Badge>
						<span class="font-medium">{data.loggedInUser.email}</span>
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardHeader>
					<CardTitle>{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
					<CardDescription>
						{isLogin
							? 'Enter your credentials to access your account'
							: 'Create a new account to get started'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form method="POST" use:enhance action="?/login" class="space-y-4">
						<input type="hidden" name="action" bind:value={$form.action} />

						{#if $message}
							<Alert.Root variant="destructive">
								<CircleAlertIcon class="size-4" />
								<Alert.Title>Error</Alert.Title>
								<Alert.Description
									>{typeof $message === 'object' ? $message.text : $message}</Alert.Description
								>
							</Alert.Root>
						{/if}

						<div class="space-y-2">
							<Label for="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="name@example.com"
								bind:value={$form.email}
								class={$errors.email ? 'border-red-500' : ''}
								required
							/>
							{#if $errors.email}
								<p class="text-sm text-red-500">{$errors.email}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="Enter your password"
								bind:value={$form.password}
								class={$errors.password ? 'border-red-500' : ''}
								required
							/>
							{#if $errors.password}
								<p class="text-sm text-red-500">{$errors.password}</p>
							{/if}
						</div>

						<Button type="submit" class="w-full" disabled={$submitting}>
							{#if $submitting}
								{isLogin ? 'Signing in...' : 'Creating account...'}
							{:else}
								{isLogin ? 'Sign In' : 'Create Account'}
							{/if}
						</Button>
					</form>

					<div class="mt-6">
						<Separator class="my-4" />
						<div class="text-center">
							<p class="text-sm text-gray-600">
								{isLogin ? "Don't have an account?" : 'Already have an account?'}
								<button
									type="button"
									on:click={toggleMode}
									class="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
								>
									{isLogin ? 'Sign up' : 'Sign in'}
								</button>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
