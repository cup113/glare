<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
</script>

<svelte:head>
    <title>GLARE | AI Model Arbitration & Comparison Tool</title>
    <meta name="description" content="Compare LLM outputs side-by-side. Quote evidence, generate XML arbitration prompts, and evaluate AI models efficiently. Built with Svelte 5 Runes." />
    <meta name="keywords" content="AI comparison, LLM arbitration, prompt engineering, Svelte 5, AI evaluation, model comparator, developer tools" />
	<link rel="icon" href={favicon} />
</svelte:head>
{@render children()}
