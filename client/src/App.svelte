<script>
  import { onMount } from 'svelte';
  import LeftArrow from './components/micro-components/LeftArrow.svelte';
  import RightArrow from './components/micro-components/RightArrow.svelte';
  import TextField from './components/micro-components/TextField.svelte';
  import Authorized from './views/Authorized.svelte';

  let authenticating = true;
  let user;
  let serenity = false;

  let search = '';

  let retrievingData = false;
  let slugs = [];
  let slugIndex = 0;
  $: if (slugIndex < 0) {
    slugIndex = 0;
  }
  $: if (slugIndex > slugs.length - 1) {
    slugIndex = slugs.length - 1;
  }

  $: console.log(slugs[0]?.slug);
  onMount(async () => {
    user = await fetch('http://localhost:4000/user', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => data.name?.split(' ')[0])
      .catch((err) => console.log(err));
    authenticating = false;
  });

  let submitSearch = async () => {
    retrievingData = true;
    if (search.length > 0) {
      slugs = await fetch('http://localhost:4000/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: search }),
      })
        .then((res) => res.json())
        .then((data) => data);
    }
    retrievingData = false;
  };
</script>

<main>
  <button on:click={() => (serenity = !serenity)} class:serenity class="peace">Serenity</button>
  {#if user && !authenticating && !serenity}
    <Authorized {user} />
  {:else if !user && !authenticating && !serenity}
    <h1>Voyage Across the Web</h1>
    <button class="login" on:click={() => (location.href = 'http://localhost:4000/auth')}>Login with Google</button>
    <div class="search-container">
      <p class="search-label">or search by domain</p>
      <TextField on:save={({ detail: content }) => (search = content)} placeholder={'www.google.com'} />
    </div>
    <button class="submit" on:click={() => (slugs = submitSearch())}>Submit</button>
    {#if retrievingData}
      <div class="loader" />
    {/if}
    {#if !retrievingData && slugs?.length > 0}
      <div class="slugs-container">
        <LeftArrow on:decrement={() => (slugIndex -= 1)} />
        <p class="results">{slugs[slugIndex]?.slug}</p>
        <RightArrow on:increment={() => (slugIndex += 1)} />
      </div>
    {/if}
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-flow: column nowrap;
    height: 100vh;
    width: 100vw;
    align-items: center;
    gap: 2rem;
  }

  .peace {
    position: absolute;
    top: 0;
    right: 0;
    width: 7rem;
    padding: 0.7rem 0.5rem;
    margin: 2rem;
    background-color: hsl(0, 0%, 78%, 0.4);
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.5);
  }
  .serenity {
    background-color: hsl(0, 0%, 78%, 0.1);
    color: rgba(255, 255, 255, 0.2);
  }
  h1 {
    color: hsl(247, 100%, 99%);
    font-size: clamp(7vw, 6vh, 8vw);
    text-align: center;
    margin-top: 25vh;
    font-family: 'Lobster', display;
    user-select: none;
  }
  button {
    color: rgb(255, 234, 234);
    border-radius: 10px;
    cursor: pointer;
  }
  button:hover {
    filter: brightness(120%) contrast(120%);
  }
  .login {
    background-color: #c8473c;
    padding: 0.7rem 1.5rem;
    font-size: 1.2rem;
    box-shadow: 2px 2px 2px rgba(148, 33, 33, 0.582);
  }
  .submit {
    background-color: #2d7d9c;
    padding: 0.4rem 1rem;
    font-size: 1.2rem;
    box-shadow: 2px 2px 2px #1b4b5e;
  }
  .search-container {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
  }
  .search-label {
    font-variant: small-caps;
    font-size: 1.1rem;
    font-family: 'Poppins', display;
    color: hsl(244, 40%, 87%);
  }
  @media screen and (max-height: 800px) {
    .search-label {
      background-color: rgb(21, 26, 46);
      color: hsla(54, 96%, 97%, 0.6);
      border-radius: 15px 15px 0px 0px;
      padding: 0.2rem 1rem;
    }
  }
  .loader {
    border: 8px solid #f3f3f300;
    border-top: 8px solid #227988;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1.5s ease-in-out infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .slugs-container {
    display: flex;
    flex-flow: row nowrap;
    gap: 2rem;
    justify-content: center;
    align-items: center;
  }
  .results {
    color: white;
    font-size: 2.5rem;
    text-align: center;
  }
</style>
