// TODO: set REACT_APP_API_URL in .env.local
export const BASE_URL = process.env.REACT_APP_API_URL || '';

function checkResponse(res) {
  if (res.ok) { return res.json(); }
  return Promise.reject(`Error: ${res.status}`);
}

export const register = (email, password) => {
  return fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ password, email }),
  })
    .then(checkResponse);
};

export const login = (email, password) => {
  return fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ password, email }),
  })
    .then(checkResponse);
};

// Verify session by calling an authenticated endpoint.
// The HttpOnly cookie is sent automatically — no token needed.
export const checkSession = () => {
  return fetch(`${BASE_URL}/authors/me`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
    .then(checkResponse);
};

export const signout = () => {
  return fetch(`${BASE_URL}/signout`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(checkResponse);
};
