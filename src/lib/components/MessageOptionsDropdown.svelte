<script lang="ts">
    import { Ellipsis, Flag, Copy } from "lucide-svelte";

    export let link = "";
    export let content = "";
    export let authorId = "";

    let reported = false;
    let open = false;
    let unqiueId = Math.random().toString(36).substring(7);

    document.addEventListener("click", (e) => {
        if (!e.target.closest(`#${unqiueId}`)) {
            open = false;
        }
    });

    async function report() {
        const res = await fetch("/api/v1/reports", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                postId: link.split("/").pop(),
                content,
                authorId,
            }),
        });

        if (res.ok || res.status === 409) {
            // we just say reported if already reported

            reported = true;
        }
    }
</script>

<div class="ml-2 my-auto text-ctp-subtext1" id={unqiueId}>
    <button
        class="open unique transition-all duration-300 hover:bg-ctp-crust/60 px-1 rounded-full"
        on:click={() => (open = !open)}
    >
        <Ellipsis size={24} />
    </button>

    {#if open}
        <div class="absolute mt-1 bg-ctp-mantle rounded-md p-2">
            <button
                class="unique"
                on:click={() => navigator.clipboard.writeText(link)}
            >
                <Copy size={24} class="my-auto" />
                <span class="ml-1 text-lg">Copy link</span>
            </button>
            <hr class="my-1 border-ctp-surface1" />
            <button
                class={`unique ${reported ? "text-ctp-green" : "text-ctp-red"}`}
                on:click={report}
            >
                <Flag size={24} class="my-auto" />
                <span class="ml-1 text-lg">Report</span>
            </button>
        </div>
    {/if}
</div>

<style>
    button:not(.open) {
        @apply transition-all duration-300 flex p-2 w-full text-left hover:bg-ctp-crust/60 rounded-md;
    }
</style>
