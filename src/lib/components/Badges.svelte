<script lang="ts">
    export let user;
    export let small = false;
</script>

<!-- Rn only staff, but have if any stuff that has badge -->
{#if user?.staff || user?.verified || user?.otherBadges?.length > 0}
    <p
        class={`size-fit my-auto ml-1.5 rounded-lg bg-ctp-mantle border border-ctp-surface0 p-1 flex space-x-1`}
    >
        {#if user.staff}
            <img
                src="https://i.imgur.com/YOKDbfI.png"
                alt="staff-badge"
                class="badge"
                width={small ? "18" : "22"}
                height={small ? "18" : "22"}
            />
        {/if}

        {#if user.verified}
            <img
                src="https://i.imgur.com/mpt9Hx0.png"
                alt="verified-badge"
                class="badge"
                width={small ? "18" : "22"}
                height={small ? "18" : "22"}
            />
        {/if}

        {#each user.otherBadges as badge}
            <img
                src={badge}
                alt="badge"
                class="badge"
                width={small ? "18" : "22"}
                height={small ? "18" : "22"}
            />
        {/each}
    </p>
{/if}
