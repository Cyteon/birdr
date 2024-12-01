<script lang="ts">
    import SideBar from "$lib/components/SideBar.svelte";
    import { Send } from "lucide-svelte";
    import { browser } from "$app/environment";
    import { getCookie } from "typescript-cookie";
    import { onMount } from "svelte";
    import { state as state } from "$lib/state.svelte";
    import { createTimeString, parsePost } from "$lib/utils";
    import MessageOptionsDropdown from "$lib/components/MessageOptionsDropdown.svelte";
    import Badges from "$lib/components/Badges.svelte";

    let postContent = "";
    let postingError = "";

    let sorting = "desc";
    let phone = false;
    let noMorePosts = false;

    if (browser) {
        window.addEventListener("resize", () => {
            phone = window.innerWidth < 768;
        });

        phone = window.innerWidth < 768;
    }

    let posts = [];

    onMount(async () => {
        const res = await fetch("/api/v1/posts", {
            headers: {
                "Content-Type": "application/json",
            },
        });

        posts = await res.json();

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting) {
                    const res = await fetch(
                        `/api/v1/posts?sort=${sorting}&offset=${posts.length}`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        },
                    );

                    let newPosts = await res.json();

                    if (newPosts.length === 0) {
                        noMorePosts = true;
                    }

                    posts = [...posts, ...newPosts];
                }
            },
            {
                threshold: 0.5,
            },
        );

        observer.observe(document.getElementById("bottom")!);
    });

    async function newSort(sort) {
        sorting = sort;

        const res = await fetch(`/api/v1/posts?sort=${sort}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        posts = await res.json();
    }

    async function post() {
        postingError = "";

        const res = await fetch("/api/v1/posts", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getCookie("token")}`,
            },
            body: JSON.stringify({ content: postContent }),
        });

        if (res.ok) {
            let post = await res.json();

            post.authorId = state.user;

            posts = [post, ...posts];
            postContent = "";
        } else {
            let data = await res.json();

            postingError = data.message;
        }
    }
</script>

<div class="flex min-h-screen w-full">
    <SideBar />
    <div
        class={`my-5 pb-3 border border-ctp-surface0 rounded-md ${phone ? "w-full mx-2" : "w-3/5 mx-auto"}`}
    >
        {#if state.user}
            <div class="pb-2 px-3 mt-2 border-b-4 border-b-ctp-surface0">
                <h1 class="text-2xl font-bold mb-2">New Post</h1>
                <textarea
                    class={`
                    w-full p-2 border border-ctp-surface0 bg-ctp-mantle rounded-md
                    focus:outline-none focus:border-ctp-surface2 transition-color duration-500
                    ${postContent.length > 0 ? "h-32" : "h-11"}
                `}
                    placeholder={`What's on your mind today @${state.user.username}?`}
                    maxlength="4000"
                    bind:value={postContent}
                ></textarea>
                <p class="mb-2 text-ctp-red text-right">
                    {postingError}
                </p>
                <div class="flex w-full justify-end">
                    <select
                        class="p-2 rounded-lg bg-ctp-crust outline-none text-lg mr-auto"
                        onchange={() => newSort(event.target.value)}
                    >
                        <option value="desc">Newest</option>
                        <option value="asc">Oldest</option>
                    </select>

                    <button
                        class={`unique p-2 rounded-md text-ctp-crust flex transition-colors duration-300 ${
                            postContent.length === 0
                                ? "bg-ctp-surface1 text-ctp-subtext1"
                                : "bg-ctp-blue"
                        }`}
                        disabled={postContent.length === 0}
                        onclick={post}
                    >
                        <Send size={24} class="my-auto" />
                        <span class="ml-2 text-lg mt-0.5">Post</span>
                    </button>
                </div>

                <div class="px- pt-1 flex w-full"></div>
            </div>
        {/if}

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
                                link={`${
                                    window.location.origin
                                }/@${post.authorId.username}/${post._id}`}
                                content={post.content}
                                authorId={post.authorId._id}
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
                </div>
            </div>
        {/each}

        {#if noMorePosts}
            <div class="pb-2 pt-4 flex">
                <p class="text-ctp-subtext1 mx-auto text-2xl">No more posts to show</p>
            </div>
        {/if}

        <div id="bottom"></div>
    </div>
</div>