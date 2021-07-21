<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { bgFade } from '../../animations/bgFade';
  export let editable;
  export let textContent;
  export let placeholder;
  export let id;
  export let noBG = false;
  $: empty = textContent === '' ? true : false;
  let transitionReady = true;
</script>

{#if !editable && transitionReady && textContent}
  <div {id} class:noBG class="field">
    {textContent}
  </div>
{:else if editable}
  <p
    {id}
    transition:bgFade
    on:introstart={() => (transitionReady = false)}
    on:outroend={() => (transitionReady = true)}
    class="editable field"
    class:empty
    contenteditable="true"
    bind:textContent
    on:blur={() => dispatch('save', textContent)}
    {placeholder}
  />
{/if}

<style>
  .field {
    color: var(--clr-main-lightText);
    padding: 0.4rem 1rem 0.4rem 1rem;
    border-radius: 5px;
    background-color: var(--clr-main-background);
    min-height: 1rem;
  }
  .field:not(.header > .field) {
    flex-grow: 2;
  }
  .field:empty:before {
    content: attr(placeholder);
    position: absolute;
    color: gray;
    background-color: transparent;
  }
  .noBG {
    background-color: transparent;
  }
  .editable {
    background-color: var(--clr-sidebar-searchBox);
    box-shadow: var(--clr-main-textAreaInsetShadow);
    border-radius: 5px;
  }
  .empty {
    width: 25rem;
  }
  .field:focus {
    box-shadow: var(--clr-main-textAreaDropShadow);
    outline: none;
  }
</style>
