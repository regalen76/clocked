<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { attendanceSchema } from '$lib/schemas/attendance.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Clock from '@lucide/svelte/icons/clock';
	import AlertCircle from '@lucide/svelte/icons/circle-alert';
	import CheckCircle from '@lucide/svelte/icons/circle-check';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const { errors, enhance, submitting } = superForm(data.form, {
		validators: zodClient(attendanceSchema),
		onUpdated: ({ form }) => {
			if (form.valid) {
				toast.success('Attendance recorded successfully!');
				// Reset form
				form.data.workDescription = '';
			}
		},
		onError: ({ result }) => {
			toast.error(result.error?.message || 'An error occurred');
		}
	});

	let currentTime = $state(new Date());
	let workDescription = $state('');

	// Update current time every second
	const updateTime = () => {
		currentTime = new Date();
	};

	$effect(() => {
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const isClockIn = $derived(!data.todayAttendance || !data.todayAttendance.clockIn);
	const isClockOut = $derived(
		data.todayAttendance && data.todayAttendance.clockIn && !data.todayAttendance.clockOut
	);
	const isCompleted = $derived(
		data.todayAttendance && data.todayAttendance.clockIn && data.todayAttendance.clockOut
	);

	type StatusBadge = {
		variant: 'default' | 'destructive' | 'secondary' | 'outline';
		text: string;
		icon: any;
	};

	const getStatusBadge = (): StatusBadge => {
		if (isCompleted) {
			return { variant: 'default', text: 'Completed', icon: CheckCircle };
		} else if (isClockOut) {
			return { variant: 'destructive', text: 'Clocked In', icon: AlertCircle };
		} else {
			return { variant: 'secondary', text: 'Not Started', icon: Clock };
		}
	};

	const status = $derived(getStatusBadge());
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="space-y-6">
		<!-- Header -->
		<div class="space-y-2 text-center">
			<h1 class="text-3xl font-bold">Attendance</h1>
			<p class="text-muted-foreground">{formatDate(currentTime)}</p>
			<div class="font-mono text-2xl">{formatTime(currentTime)}</div>
		</div>

		<!-- Status Card -->
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<CardTitle>Today's Status</CardTitle>
					<Badge variant={status.variant} class="flex items-center gap-1">
						{@const Icon = status.icon}
						<Icon />
						{status.text}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<Label class="text-sm font-medium">Clock In</Label>
						<p class="text-muted-foreground text-sm">
							{data.todayAttendance?.clockIn
								? new Date(data.todayAttendance.clockIn).toLocaleTimeString('en-US', {
										hour: '2-digit',
										minute: '2-digit'
									})
								: '--:--'}
						</p>
					</div>
					<div>
						<Label class="text-sm font-medium">Clock Out</Label>
						<p class="text-muted-foreground text-sm">
							{data.todayAttendance?.clockOut
								? new Date(data.todayAttendance.clockOut).toLocaleTimeString('en-US', {
										hour: '2-digit',
										minute: '2-digit'
									})
								: '--:--'}
						</p>
					</div>
				</div>

				{#if data.todayAttendance?.workDescription}
					<div class="mt-4">
						<Label class="text-sm font-medium">Work Description</Label>
						<p class="text-muted-foreground mt-1 text-sm">{data.todayAttendance.workDescription}</p>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Clock In/Out Form -->
		{#if !isCompleted}
			<Card>
				<CardHeader>
					<CardTitle>
						{isClockIn ? 'Clock In' : 'Clock Out'}
					</CardTitle>
					<CardDescription>
						{isClockIn
							? 'Start your work day by clocking in'
							: 'End your work day and describe what you accomplished'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="POST"
						action="?/{isClockIn ? 'clockIn' : 'clockOut'}"
						use:enhance
						class="space-y-4"
					>
						{#if isClockOut}
							<div class="space-y-2">
								<Label for="workDescription">What did you do today? *</Label>
								<Textarea
									id="workDescription"
									name="workDescription"
									bind:value={workDescription}
									placeholder="Describe your work activities, achievements, and tasks completed today..."
									class="min-h-[100px]"
									required
								/>
								{#if $errors.workDescription}
									<p class="text-destructive text-sm">{$errors.workDescription}</p>
								{/if}
							</div>
						{/if}

						<Button
							type="submit"
							class="w-full"
							disabled={$submitting || (isClockOut && !workDescription.trim())}
						>
							{#if $submitting}
								<Clock class="mr-2 h-4 w-4 animate-spin" />
								Processing...
							{:else}
								<Clock class="mr-2 h-4 w-4" />
								{isClockIn ? 'Clock In' : 'Clock Out'}
							{/if}
						</Button>
					</form>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardContent class="pt-6">
					<div class="space-y-2 text-center">
						<CheckCircle class="mx-auto h-12 w-12 text-green-500" />
						<h3 class="text-lg font-semibold">All done for today!</h3>
						<p class="text-muted-foreground">
							You have successfully completed your attendance for today.
						</p>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
