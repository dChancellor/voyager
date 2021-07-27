export const server = process.env.server;

export const getUser = async () => {
  return fetch(`${server}/user`, {
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((data) => data.user?.displayName.split(' ')[0])
    .catch((err) => console.log(err));
};

export const getSlugs = async (url) => {
  return fetch(`${server}/url`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })
    .then((res) => res.json())
    .then((data) => (data.message ? Promise.reject(data.message) : [data, null]))
    .catch((error) => {
      return [[{ slug: '' }], error];
    });
};

export const newSlug = async ({ slug, url }) => {
  return fetch(`${server}/auth/newSlug`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slug, url }),
  })
    .then((res) => res.json())
    .then((data) => (data.message ? Promise.reject(data.message) : data))
    .catch((error) => {
      return error;
    });
};

export const newUser = async ({ name: displayName, googleId, email }) => {
  return fetch(`${server}/auth/newUser`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ displayName, googleId, email }),
  })
    .then((res) => res.json())
    .then((data) => (data.message ? Promise.reject(data.message) : data))
    .catch((error) => {
      return error;
    });
};
