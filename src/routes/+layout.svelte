<script lang="ts">
	import '../app.css';
	import { state } from '$lib/state.svelte';
	import { onMount } from 'svelte';
	import { getCookie } from 'typescript-cookie';

	let { children } = $props();

	onMount(async () => {
	    let token = getCookie('token');

		if (token) {
          const res = await fetch('/api/v1/users/@me', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

        if (res.ok) {
          const data = await res.json();
          state.user = data;
        }
      }
	});
</script>

{@render children()}
