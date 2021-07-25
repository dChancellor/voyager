<script>
  import TextField from '../components/micro-components/TextField.svelte';
  import { server, newSlug, newUser } from '../helpers/fetch';
  export let user;
  let error = false;
  let states = [
    {
      name: 'slug',
      fields: [
        { name: 'slug', placeholder: 'goog', required: false, value: '' },
        { name: 'url', placeholder: 'www.google.com', required: true, value: '' },
      ],
      submit: async (data) => {
        let dataPack = data.reduce((pack, field) => {
          pack = { ...pack, ...{ [field.name]: field.value } };
          return pack;
        }, {});
        let res = await newSlug(dataPack);
      },
    },
    {
      name: 'user',
      fields: [
        { name: 'name', placeholder: 'John', required: true, value: '' },
        { name: 'googleId', placeholder: '12345', required: true, value: '' },
        { name: 'email', placeholder: 'john@fakeemail.com', required: false, value: '' },
      ],
      submit: async (data) => {
        let dataPack = data.reduce((pack, field) => {
          pack = { ...pack, ...{ [field.name]: field.value } };
          return pack;
        }, {});
        let res = await newUser(dataPack);
      },
    },
  ];
  let active = states[0];

  let activateState = (target) => (active = states.find((state) => state.name === target));

  let handleSubmit = async () => {
    error = active.fields.forEach((field) => field.required && !field.value);
    if (!error) await active.submit(active.fields);
  };
</script>

<h1>Welcome to your voyage, {user}</h1>
<div class="button-row">
  <button on:click={() => activateState('slug')} class="logged-in-buttons new-slug">New Short</button>
  <button on:click={() => activateState('user')} class="logged-in-buttons new-user">New User</button>
  <button on:click={() => (location.href = `${server}/logout`)} class="logged-in-buttons logout">Logout</button>
</div>
<div class="fields">
  {#each active.fields as { name, placeholder, required, error, value } (name)}
    <p>{name}</p>
    <TextField on:save={({ detail: content }) => (value = content)} {value} {placeholder} {required} {error} />
  {/each}
  <button on:click={() => handleSubmit()} class="submit">Submit</button>
</div>

<style>
  h1 {
    color: hsl(247, 100%, 99%);
    font-size: clamp(7vw, 6vh, 8vw);
    text-align: center;
    margin-top: 25vh;
    font-family: 'Lobster', display;
    user-select: none;
    font-size: 6vh;
  }
  .fields {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  p {
    color: white;
    font-family: 'Poppins', monospace;
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
  .submit {
    background-color: #2d7d9c;
    padding: 0.4rem 1rem;
    font-size: 1.2rem;
    box-shadow: 2px 2px 2px #1b4b5e;
    margin-top: 2rem;
  }
</style>
