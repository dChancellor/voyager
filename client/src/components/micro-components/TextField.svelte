<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  let textContent;
  export let placeholder = 'www.google.com';
  $: empty = textContent === '' ? true : false;
</script>

<p
  class="editable field"
  on:blur={() => dispatch('save', textContent)}
  class:empty
  contenteditable="true"
  bind:textContent
  {placeholder}
/>

<style>
  .field {
    padding: 0.4rem 1rem 0.4rem 1rem;
    border-radius: 20px;
    min-height: 1rem;
    background-color: hsl(235, 28%, 83%, 0.19);
    color: rgb(247, 242, 197);
    font-family: 'Poppins', display;
    min-width: 20rem;
    text-align: center;
    box-shadow: inset 2px 2px 4px 4px rgba(0, 0, 0, 0.1);
    font-size: 1.4rem;
  }
  .field:not(.header > .field) {
    flex-grow: 2;
  }
  .field:focus:empty:before {
    content: attr(placeholder);
    color: rgb(247, 242, 197, 0.4);
    background-color: transparent;
    width: 100%;
    outline: 1px red;
  }
  .empty {
    width: 10rem;
  }
  .field:focus {
    box-shadow: 2px 2px 4px 4px rgba(0, 0, 0, 0.2);
    outline: none;
    text-align: center;
  }
  @media screen and (max-height: 800px) {
    .field {
      background-color: rgb(27, 32, 90, 0.85);
    }
  }
</style>
