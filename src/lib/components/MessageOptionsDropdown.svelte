<script lang="ts">
    import { Ellipsis, Flag, Copy, Trash, Pin } from "lucide-svelte";
    import { state } from "$lib/state.svelte";
    import { getCookie } from "typescript-cookie";
    import { browser } from "$app/environment";

    export let post;
    export let link = `${
        window.location.origin
    }/@${post.authorId.username}/${post._id}`

    export let content = post.content;
    export let authorId = post.authorId._id;

    console.log(post);

    let reported = false;
    let deleted = false;
    let open = false;
    let unqiueId = `dropdown-${Math.random().toString(36).substring(7)}`;

    if (browser) {
        document.addEventListener("click", (e) => {
            if (!e.target.closest(`#${unqiueId}`)) {
                open = false;
            }
        });
    }

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

    async function _delete(id) {
        const res = await fetch(`/api/v1/posts/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            deleted = true;
        }
    }

    async function pin() {
        const res = await fetch(`/api/v1/posts/${link.split("/").pop()}/pinned`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            post.pinned = true;
        }
    }

    async function unpin() {
        const res = await fetch(`/api/v1/posts/${link.split("/").pop()}/pinned`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
        });

        if (res.ok) {
            post.pinned = false;
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

            {#if state.user && state.user.staff}
                <button
                    class="unique"
                    on:click={() => (post.pinned ? unpin() : pin())}
                > 
                    <Pin size={24} class="my-auto" />
                    <span class="ml-1 text-lg mb-0.5">
                        {post.pinned ? "Unpin" : "Pin"}
                    </span>
                </button>
            {/if}

            {#if state.user && (state.user._id === authorId || state.user.staff)}
                

                <button
                    class={`unique  ${deleted ? "text-ctp-green" : "text-ctp-red"}`}
                    on:click={() => _delete(link.split("/").pop())}
                >
                    <Trash size={24} class="my-auto" />
                    <span class="ml-1 text-lg">Delete</span>
                </button>

                <hr class="my-1 border-ctp-surface1" />
            {/if}

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
