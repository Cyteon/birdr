<script lang="ts">
    import { state } from "$lib/state.svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import { getCookie } from "typescript-cookie";
    import { browser } from "$app/environment";

    let displayName = "";
    let username = "";
    let userInfoError = "";
    let userInfoSuccess = "";

    let theme: "latte" | "frappe" | "macchiato" | "mocha" = "macchiato";

    if (browser) {
        theme = localStorage.getItem("theme") as "latte" | "frappe" | "macchiato" | "mocha" || "macchiato";
    }

    function updateTheme() {
        localStorage.setItem("theme", theme);
        document.documentElement.className = `ctp-${theme}`;
    }

    async function updateUserInfo() {
        userInfoError = "";
        userInfoSuccess = "";

        let body = {};

        if (displayName !== "") {
            body.displayName = displayName;
        }

        if (username !== "") {
            body.username = username;
        }

        const res = await fetch("/api/v1/users/@me", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            state.user = await res.json();

            userInfoSuccess = "Successfully updated user info!";
        } else {
            userInfoError = (await res.json()).message;
        }
    }
</script>

<div class="flex min-h-screen w-full">
    <SideBar />

    <div class="m-3 p-2 border border-ctp-surface0 rounded-md w-full">
        <h1 class="text-3xl font-bold">Settings</h1>

        <div class="mt-5 flex flex-wrap">
            <div class="mr-2 mb-2 flex flex-col w-64">
                <h1 class="text-xl font-semibold">Display Name</h1>
                <input
                    type="text"
                    placeholder={state.user?.displayName as string}
                    bind:value={displayName}
                />

                <h1 class="text-xl font-semibold mt-3">Username</h1>
                <input
                    type="text"
                    placeholder={state.user?.username as string}
                    bind:value={username}
                    />

                {#if userInfoError}
                    <p class="text-ctp-red mt-2 text-lg">
                        {userInfoError}
                    </p>
                {:else if userInfoSuccess}
                    <p class="text-ctp-green mt-2 text-lg">
                        {userInfoSuccess}
                    </p>
                {/if}


                <button
                    class="text-xl py-2 mt-2"
                    on:click={() => updateUserInfo()}
                >
                    Update
                </button>
            </div>
            <div>
                <h1 class="text-xl font-semibold">Theme</h1>
                <div class="flex flex-col">
                    <select class="mt-2 p-3 rounded-md" bind:value={theme} on:change={() => updateTheme()}>
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
    input, select:not(.unique2) {
        outline: none;
        @apply w-64 text-lg p-2 mt-2 border border-ctp-surface0 bg-ctp-mantle rounded-md;
    }
</style>
