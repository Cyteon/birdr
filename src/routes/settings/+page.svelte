<script lang="ts">
    import { state } from "$lib/state.svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import { Bug } from "lucide-svelte";
    import { browser } from "$app/environment";

    let displayName = "";
    let theme: "latte" | "frappe" | "macchiato" | "mocha" = "macchiato";

    if (browser) {
        theme =
            (localStorage.getItem("theme") as
                | "latte"
                | "frappe"
                | "macchiato"
                | "mocha") || "macchiato";
    }

    function updateTheme() {
        localStorage.setItem("theme", theme);
        document.documentElement.className = `ctp-${theme}`;
    }
</script>

<div class="flex min-h-screen w-full">
    <SideBar />

    <div class="m-3 p-2 border border-ctp-surface0 rounded-md w-full">
        <h1 class="text-3xl font-bold">Settings</h1>

        <div class="mt-5 flex flex-wrap">
            <div>
                <h1 class="text-2xl font-semibold">Theme</h1>
                <div class="flex flex-col">
                    <select
                        class="mt-2 p-3 rounded-md"
                        bind:value={theme}
                        on:change={() => updateTheme()}
                    >
                        <option value="latte">Latte</option>
                        <option value="frappe">Frappe</option>
                        <option value="macchiato">Macchiato</option>
                        <option value="mocha">Mocha</option>
                        <option value="black-white">Black & White</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    input,
    select:not(.unique2) {
        outline: none;
        @apply w-64 text-lg p-2 mt-2 border border-ctp-surface0 bg-ctp-mantle rounded-md;
    }
</style>
