<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { createTimeString, parsePost } from "$lib/utils";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import MessageOptionsDropdown from "$lib/components/MessageOptionsDropdown.svelte";
    import Badges from "$lib/components/Badges.svelte";

    let { data } = $props();

    let notFound = $state(false);
    let phone = $state(false);

    let post = $state(null);

    onMount(async () => {
        const res = await fetch(`/api/v1/posts/${data.slug}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            post = await res.json();
            console.log(post);
        } else {
            notFound = true;
        }
    });

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;
    }
</script>

<div class="flex min-h-screen w-full">
    <SideBar />
    <div class="w-full flex">
        {#if notFound}
            <div class="m-auto">
                <h1 class="text-3xl font-bold text-ctp-red">Post not found</h1>
            </div>
        {:else if post}
            <div
                class={`m-3 border border-ctp-surface0 rounded-md ${phone ? "w-full mx-2" : "w-3/5 mx-auto"}`}
            >
                <div class="px-3 py-4 border-b border-b-ctp-surface0 flex">
                    <img
                        src={post.authorId.avatarUrl}
                        alt={post.authorId.username}
                        class="w-14 h-14 rounded-full"
                    />
                    <div class="ml-2 w-full">
                        <div class="flex w-full">
                            <h1 class="text-2xl font-bold leading-none">
                                {post.authorId.displayName}
                            </h1>
                            <Badges user={post.authorId} small={true} />
                            <span
                                class="text-ctp-subtext0 ml-1 mt-[5px] leading-none my-auto"
                            >
                                @{post.authorId.username}
                            </span>
                            <span class="ml-auto flex">
                                {#if !phone}
                                    <span class="text-ctp-subtext1"
                                        >{createTimeString(post.postedAt)}</span
                                    >
                                {/if}

                                <MessageOptionsDropdown
                                    link={window.location.href}
                                    content={post.content}
                                    authorId={post.authorId._id}
                                />
                            </span>
                        </div>
                        <p class="text-lg prose">
                            {@html parsePost(post.content, false)}
                        </p>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
