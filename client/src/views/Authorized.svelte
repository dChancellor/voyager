<script>
  import TextField from '../components/micro-components/TextField.svelte';
  export let user;
  let active = 'slug';
</script>

<h1>Welcome to your voyage, {user}</h1>
<div class="button-row">
  <button on:click={() => active === 'slug'} class="logged-in-buttons new-slug">New Short</button>
  <button on:click={() => active === 'user'} class="logged-in-buttons new-user">New User</button>
  <button on:click={() => (location.href = 'http://localhost:4000/logout')} class="logged-in-buttons logout"
    >Logout</button
  >
</div>
{#if active === 'slug'}
  <p>slug:</p>
  <TextField placeholder={'goog'} />
  <p>url:</p>
  <TextField placeholder={'www.google.com'} />
{:else if active === 'user'}
  <p>name:</p>
  <TextField placeholder={'John'} />
  <p>google id:</p>
  <TextField placeholder={'1241495'} />
  <p>email:</p>
  <TextField placeholder={'john@fakeemail.com'} />
{/if}

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
  .button-row {
    display: flex;
    gap: 1rem;
  }
  .logged-in-buttons {
    width: 8rem;
    padding: 1rem 0.5rem;
    font-size: 1.2rem;
  }
  .new-slug {
    background-color: #2d7d9c;
    box-shadow: 2px 2px 2px #1b4b5e;
  }
  .new-user {
    background-color: #2d9c71;
    box-shadow: 2px 2px 2px #1b5e3f;
  }
  .logout {
    background-color: #c8473c;
    box-shadow: 2px 2px 2px rgba(148, 33, 33, 0.582);
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
</style>
