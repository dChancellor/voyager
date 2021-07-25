<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let placeholder;
  export let required;
  export let value;
  export let error;
  let textContent = value;
  $: empty = textContent === '' ? true : false;
</script>

<p
  class:error
  class:required
  class="editable field"
  on:blur={() => dispatch('save', textContent)}
  class:empty
  contenteditable="true"
  bind:textContent
  {placeholder}
/>
{#if error}
  <span class="required-message">required!</span>
{/if}

<style>
  .required-message {
    color: #863737;
  }
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
  .error.required {
    box-shadow: inset 0px 0px 4px 2px rgba(121, 0, 0, 0.692);
  }
</style>
