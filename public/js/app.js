let reqInput = document.querySelector('.req');
let slugInput = document.querySelector('#input-slug');
let inputs = document.querySelectorAll('input');
let responseCard = document.querySelector('#response-card');
let responseMessage = document.querySelector('#response-message');
let responseUrl = document.querySelector('#response-url');
let submitButton = document.querySelector('.submit');

window.addEventListener('load', (event) => {
  inputs.forEach((input) => (input.value = ''));
});

let placeholders = {
  'input-url': { placeholder: 'https://google.com' },
  'input-slug': { placeholder: 'xdjfi' },
  'input-user': { placeholder: '11111' },
};

function focusFunction(event) {
  let counter = 0;
  event === 'show'
    ? (inputs.forEach((input) => {
        input.placeholder = placeholders[input.id].placeholder;
      }),
      (submitButton.style.display = 'block'))
    : (inputs.forEach((input) => {
        input.value != '' ? counter++ : null, (input.placeholder = '');
      }),
      counter === 0 ? (submitButton.style.display = '') : (submitButton.style.display = 'block'));
}

function fillResponseCard(res, result, type) {
  res === 'url'
    ? (  responseUrl.innerHTML = '',
      responseUrl.href = '',
      (responseCard.style.backgroundColor = 'rgba(33, 68, 89, 0.48)'),
      (responseMessage.innerHTML = `You have ${type} a shortened id at `),
      (responseUrl.innerHTML = `${window.location.hostname}/${result.slug}`),
      (responseUrl.href = `https://${window.location.hostname}/${result.slug}`),
      (reqInput.value = ''))
    : res === 'user'
    ? ((responseCard.style.backgroundColor = 'rgba(33, 68, 89, 0.48)'),
      (responseMessage.innerHTML = `You have created a new user`),
      (reqInput.value = ''))
    : ((responseMessage.innerHTML = result.error),
      (responseCard.style.backgroundColor = 'rgba(201, 63, 51, 0.86)'));
  responseCard.style.display = 'block';
}

async function findByUrl() {
  let url = reqInput.value
    .split('https://')
    .pop()
    .split('http://')
    .pop()
    .split('www.')
    .pop();
  const response = await fetch(`/find/${url}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  });
  if (response.ok) {
    const result = await response.json();
    fillResponseCard('url', result, 'found');
  } else {
    const result = await response.json();
    fillResponseCard('failure', result);
  }
}

async function createUrl() {
  if (reqInput.value === '') {
    fillResponseCard('failure', (result = { error: 'URL field empty' }));
  } else {
    if (reqInput.value.startsWith('https://') == false) {
      url = `https://${reqInput.value}`;
    } else {
      url = reqInput.value;
    }
    const response = await fetch('/auth/url', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        slug: slugInput.value || undefined,
      }),
    });
    if (response.ok) {
      const result = await response.json();
      fillResponseCard('url', result, 'created');
    } else {
      const result = await response.json();
      fillResponseCard('failure', result);
    }
  }
}

async function createUser() {
  if (reqInput.value === '') {
    fillResponseCard('failure', (result = { error: 'User field empty' }));
  } else {
    const response = await fetch('/auth/addUser', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        userid: reqInput.value,
      }),
    });
    if (response.ok) {
      const result = await response.json();
      fillResponseCard('user', result, 'created');
    } else {
      const result = await response.json();
      fillResponseCard('failure', result);
    }
  }
}
