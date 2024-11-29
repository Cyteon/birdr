<script lang="ts">
    import { page } from "$app/stores";
    import SideBar from "$lib/components/SideBar.svelte";
</script>

<div class="flex min-h-screen w-full">
    <SideBar />
    <div class="m-auto px-3">
        <h1 class="text-ctp-red text-4xl font-bold">Error: {$page.status}</h1>
        <p class="text-ctp-subtext1 text-xl">
            {#if $page.status === 404}
                The page you are looking for does not exist.
            {:else if $page.status === 401 || $page.status === 403}
                You are not authorized to view this page.
            {:else if $page.status === 500}
                Something went wrong on our end. Please try again later.
            {:else}
                {$page.status}: {$page.error.message}
            {/if}
        </p>
    </div>
</div>
