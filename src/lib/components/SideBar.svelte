<script lang="ts">
    import { Menu, Home, Globe2, Cog } from "lucide-svelte";
    import { browser } from "$app/environment";

    let location = "";
    let phone = false;

    if (browser) {
        location = window.location.pathname;

        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });
    }

    let expanded = false;
</script>

<nav
    class={`bg-ctp-mantle h-full border-r border-r-ctp-surface0 p-1 py-5 flex flex-col items-center transition-all duration-300 ${
        expanded ? (phone ? "w-32" : "w-36") : "w-16"
    }`}
>
    <h1 class="text-lg font-bold">IDK</h1>

    <div class="mt-5 flex flex-col items-center transition-all duration-300">
        <a href="/" class={location === "/" ? "text-ctp-blue" : ""}>
            <Home size={24} class="my-auto" />
            <span class="ml-2 text-lg font-semibold" hidden={!expanded}
                >Home</span
            >
        </a>
        <a href="/recent" class={location === "/recent" ? "text-ctp-blue" : ""}>
            <Globe2 size={24} class="my-auto" />
            <span class="ml-2 text-lg font-semibold" hidden={!expanded}
                >Recent</span
            >
        </a>
        <!---
        <a
            href="/settings"
            class={location === "/settings" ? "text-ctp-blue" : ""}
        >
            <Cog size={24} class="my-auto" />
            <span class="ml-2 text-lg font-semibold" hidden={!expanded}
                >Settings</span
            >
        </a>
        --->
    </div>

    <button
        class="mt-auto text-center transition-colors duration-500 hover:bg-ctp-crust p-1 rounded-md"
        on:click={() => (expanded = !expanded)}
    >
        <Menu size={32} />
    </button>
</nav>

<style>
    a {
        @apply p-2 w-full text-center flex transition-colors duration-500 hover:bg-ctp-crust rounded-md mb-1;
    }
</style>
