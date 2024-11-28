<script lang="ts">
    let identifier = "";
    let password = "";
    let error = "";
    let loading = false;

    function login() {
        error = "";
        loading = true;

        if (!identifier || !password) {
            error = "Please fill in all the fields";
            loading = false;
            return;
        }
    }
</script>

<div class="h-screen w-full flex">
    <div class="p-2 m-auto">
        <form class="bg-ctp-mantle p-5 rounded-md" onsubmit={login}>
            <h1 class="font-bold text-3xl">Welcome Back!</h1>
            <label for="identifier" class="block mt-5 text-lg"
                >Username or Email</label
            >
            <input
                type="text"
                id="identifier"
                placeholder="Username or Email"
                class="w-full text-lg p-2 my-2 border-2 border-ctp-base bg-ctp-crust rounded-lg"
            />
            <label for="password" class="block mt-2 text-lg">Password</label>
            <input
                type="password"
                id="password"
                placeholder="Password"
                class="w-full text-lg p-2 my-2 border-2 border-ctp-base bg-ctp-crust rounded-lg"
            />
            <p class="text-ctp-red">{error}</p>
            <button
                class="w-full bg-ctp-blue text-ctp-crust text-lg p-2 mt-3 rounded-lg"
            >
                Login
            </button>
        </form>
    </div>
</div>
