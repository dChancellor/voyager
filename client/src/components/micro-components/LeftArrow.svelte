<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div on:click={() => dispatch('decrement')} class="button">
  <svg xmlns="http://www.w3.org/2000/svg" class="arrow" viewBox="0 0 20 20">
    <path
      fill-rule="evenodd"
      d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
      clip-rule="evenodd"
    />
  </svg>
</div>

<style>
  div {
    width: 4.5rem;
  }
  .arrow {
    fill: rgb(54, 108, 129);
    filter: drop-shadow(2px 2px 2px rgb(52, 91, 122));
    cursor: pointer;
    width: 100%;
  }
  .arrow:hover {
    filter: brightness(150%);
  }
</style>
