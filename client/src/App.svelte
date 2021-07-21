<script>
  // import Canvas  from './views/Canvas.svelte';
</script>

<main>
  <h1>Welcome to the ShopkeepJS version of the Svelte template!</h1>
</main>

<style>
  main {
    display: flex;
    flex-flow: row nowrap;
    height: 100vh;
    width: 100vw;
    background-color: var(--clr-main-background);
    justify-content: center;
    align-items: center;
  }
  h1 {
    color: var(--clr-main-lightText);
    font-size: 3rem;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
