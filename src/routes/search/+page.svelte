<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { createTimeString, parsePost } from "$lib/utils";
    import MessageOptionsDropdown from "$lib/components/MessageOptionsDropdown.svelte";
    import Badges from "$lib/components/Badges.svelte";
    import { MessageSquare } from "lucide-svelte";

    let phone = false;

    let search = "";

    let posts = [];

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;

        let urlParams = new URLSearchParams(window.location.search);
        search = urlParams.get("q") || "";
    }

    onMount(async () => {
        const res = await fetch(`/api/v1/posts/search?q=${search}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        posts = await res.json();
    });
</script>

<div class="flex min-h-screen w-full">
    <SideBar />

    <div class={`my-5 ${phone ? "w-full mx-2" : "w-3/5 mx-auto"}`}>
        <div class="flex">
            <input 
                type="text"
                placeholder="Search" 
                class="w-full p-2 border border-ctp-surface0 bg-ctp-mantle rounded-md outline-none focus:border-ctp-surface2 focus:outline-none transition-color duration-500" 
                bind:value={search}
            />
            <button class="my-auto h-10 ml-1" onclick={() => window.location.href = `/search?q=${search}`}>
                Search
            </button>   
        </div>

        <div
            class="my-5 pb-3 border border-ctp-surface0 rounded-md"
        >
            {#if posts.length === 0}
                <h1 class="text-ctp-subtext1 text-xl text-center mt-3">No posts found</h1>
            {:else}
                {#each posts as post}
                    <div class="py-3 px-3 border-b border-b-ctp-surface0 flex" id={post._id}>
                        <img
                            src={post.authorId.avatarUrl}
                            alt={post.authorId.username}
                            class="w-14 h-14 rounded-full object-cover"
                        />
                        <div class="ml-2 w-full">
                            <p class="flex">
                                <a
                                    class="text-2xl font-bold leading-none"
                                    href={`/@${post.authorId.username}`}
                                >
                                    {post.authorId.displayName}
                                </a>
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
                                        post={post}
                                    />
                                </span>
                            </p>
                            <p class="text-lg prose">
                                {@html parsePost(
                                    post,
                                    true,
                                    `/@${post.authorId.username}/${post._id}`,
                                )}
                            </p>
                            <div class="flex mt-2">
                                <a href={`/@${post.authorId.username}/${post._id}`} class="flex">
                                    <MessageSquare size={24} class="my-auto" />
                                    <span class="ml-1 mb-1">{post.commentCount}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>