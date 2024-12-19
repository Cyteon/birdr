<script lang="ts">
    import { state } from "$lib/state.svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
</script>

<div class="flex min-h-screen w-full">
    <SideBar />

    <div class="m-3 p-2 border border-ctp-surface0 rounded-md w-full">
        <h1 class="text-3xl font-bold">Confirm Account Deletion</h1>

        <button class="unique text-ctp-crust font-semibold text-lg bg-ctp-red p-2 mt-2 rounded-md" on:click={() => {
            fetch("/api/v1/users/@me", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getCookie("token")}`,
                },
            });

            state.user = null;
            window.location.href = "/";
        }}>Delete Account and all Data (Cannot be undone)</button>
    </div>
</div>