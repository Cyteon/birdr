<script lang="ts">
    import {
        Menu,
        Home,
        Globe2,
        Cog,
        KeyRound,
        LogOut,
        Shield,
    } from "lucide-svelte";
    import { browser } from "$app/environment";
    import { state } from "$lib/state.svelte";
    import { removeCookie, getCookie } from "typescript-cookie";

    let location = "";
    let phone = false;

    if (browser) {
        location = window.location.pathname;

        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;
    }

    let expanded = false;

    $: if (phone) {
        expanded = false;
    } else {
        expanded = true;
    }

    async function logOut() {
        state.user = null;

        await fetch("/api/v1/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        removeCookie("token");
    }
</script>

<nav
    class={`bg-ctp-mantle border-r border-r-ctp-surface0 p-1 flex items-center transition-all duration-300 ${
        expanded ? (phone ? "w-32" : "w-36") : "w-16"
    } ${phone ? "flex w-full h-fit fixed inset-x-0 bottom-0 justify-center" : "flex-col h-screen sticky top-0 py-5"}`}
>
    {#if !phone}
        <h1 class="text-xl font-bold">Birdr</h1>
    {/if}

    <div class={`flex ${phone ? "flex space-x-4" : "flex-col mt-3"} items-center transition-all duration-300`}>
        <a href="/" class={location === "/" ? "text-ctp-blue" : ""}>
            <Home size={32} class="my-auto" />
            <span class="ml-2 text-xl my-auto font-semibold" hidden={!expanded}
                >Home</span
            >
        </a>

        {#if state.user}
            <a
                href="/settings"
                class={location === "/settings" ? "text-ctp-blue" : ""}
            >
                <Cog size={32} class="my-auto" />
                <span class="ml-2 text-lg font-semibold" hidden={!expanded}
                    >Settings</span
                >
            </a>

            <a
                href={`/@${state.user.username}`}
                class={location === `/@${state.user.username}`
                    ? "text-ctp-blue"
                    : ""}
            >
                <img
                    src={state.user.avatarUrl}
                    alt={state.user.username}
                    class="w-8 h-8 rounded-full"
                />
                <span
                    class="ml-2 my-auto text-xl font-semibold"
                    hidden={!expanded}>Profile</span
                >
            </a>
            <button class="unique a-style" on:click={logOut}>
                <LogOut size={32} class="my-auto" />
                <span class="ml-2 text-xl font-semibold" hidden={!expanded}
                    >Logout</span
                >
            </button>
        {/if}

        {#if !state.user}
            <a
                href="/auth/login"
                class={location === "/auth/login" ? "text-ctp-blue" : ""}
            >
                <KeyRound size={32} class="my-auto" />
                <span class="ml-2 text-xl font-semibold" hidden={!expanded}
                    >Login</span
                >
            </a>
        {/if}

        {#if state?.user?.staff}
            <hr class="w-full border-ctp-surface1 my-1" />

            <a
                href="/admin/reports"
                class={location === "/admin/reports" ? "text-ctp-blue" : ""}
            >
                <Shield size={32} class="my-auto" />
                <span class="ml-2 text-xl font-semibold" hidden={!expanded}
                    >Reports</span
                >
            </a>
        {/if}
    </div>

    {#if !phone}
        <button
            class="unique mt-auto text-center transition-colors duration-500 hover:bg-ctp-crust p-1 rounded-md bg-ctp-mantle text-ctp-text"
            on:click={() => (expanded = !expanded)}
        >
            <Menu size={32} />
        </button>
    {/if}
</nav>

<style>
    a,
    .a-style {
        @apply p-2 w-full text-center flex transition-colors duration-500 hover:bg-ctp-crust rounded-md mb-1;
    }
</style>
