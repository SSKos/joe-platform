// TODO: set REACT_APP_API_URL in .env.local
// In production Express serves the SPA and the API from the same origin,
// so the base URL is empty (same-origin requests).
// Set REACT_APP_API_URL=http://localhost:2000 in frontend/.env for local dev.
const BASE_URL = process.env.REACT_APP_API_URL || '';

class Api {
  constructor(config) {
    this._baseUrl = config.baseUrl;
    this._headers = config.headers;
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(`Error: ${res.status}`);
  }

  // Auth cookie is sent automatically via credentials: 'include' — no manual token needed.

  // Authors
  getUserInfo() {
    return fetch(`${this._baseUrl}/authors/me`, {
      method: 'GET',
      headers: this._headers,
      credentials: 'include',
    })
      .then(this._checkResponse);
  }

  getAuthorByEmail(authorEmail) {
    return fetch(`${this._baseUrl}/authors/email/${authorEmail}`, {
      method: 'GET',
      headers: this._headers,
      credentials: 'include',
    })
      .then(this._checkResponse);
  }

  getAuthorByID(authorID) {
    return fetch(`${this._baseUrl}/authors/ID/${authorID}`, {
      method: 'GET',
      headers: this._headers,
      credentials: 'include',
    })
      .then(this._checkResponse);
  }

  editUser(inputData) {
    return fetch(`${this._baseUrl}/authors/me`, {
      method: 'PATCH',
      headers: this._headers,
      credentials: 'include',
      body: JSON.stringify(inputData),
    })
      .then(this._checkResponse);
  }

  editAvatar(inputData) {
    return fetch(`${this._baseUrl}/authors/me/avatar`, {
      method: 'PATCH',
      headers: this._headers,
      credentials: 'include',
      body: JSON.stringify(inputData),
    })
      .then(this._checkResponse);
  }

  // Articles (public)
  getInitialAbstracts() {
    return fetch(`${this._baseUrl}/articles`, {
      method: 'GET',
      headers: this._headers,
    })
      .then(this._checkResponse);
  }

  getPublishedArticle(articleID, revisionID) {
    const responseArticle = fetch(`${this._baseUrl}/articles/${articleID}`, {
      method: 'GET',
      headers: this._headers,
    })
      .then(this._checkResponse);

    const responseRevision = fetch(`${this._baseUrl}/articles/${articleID}/revisions/${revisionID}`, {
      method: 'GET',
      headers: this._headers,
    })
      .then(this._checkResponse);

    return Promise.all([responseArticle, responseRevision]);
  }

  // Authorized article actions
  getMyArticles() {
    return fetch(`${this._baseUrl}/myaccount`, {
      method: 'GET',
      headers: this._headers,
      credentials: 'include',
    })
      .then(this._checkResponse);
  }

  getMyArticle(articleID) {
    return fetch(`${this._baseUrl}/myaccount/articles/${articleID}`, {
      method: 'GET',
      headers: this._headers,
      credentials: 'include',
    })
      .then(this._checkResponse);
  }

  createArticle() {
    return fetch(`${this._baseUrl}/articles/create`, {
      method: 'POST',
      headers: this._headers,
      credentials: 'include',
    })
      .then(this._checkResponse);
  }

  createRevision(revision) {
    return fetch(`${this._baseUrl}/articles/${revision.articleID}/revisions`, {
      method: 'POST',
      headers: this._headers,
      credentials: 'include',
      body: JSON.stringify(revision),
    })
      .then(this._checkResponse);
  }

  saveArticle(inputData) {
    return fetch(`${this._baseUrl}/articles/submit`, {
      method: 'POST',
      headers: this._headers,
      credentials: 'include',
      body: JSON.stringify(inputData),
    })
      .then(this._checkResponse);
  }

  putLike(articleID) {
    return fetch(`${this._baseUrl}/articles/${articleID}/likes`, {
      method: 'PUT',
      headers: this._headers,
      credentials: 'include',
    })
      .then(this._checkResponse);
  }

  deleteLike(articleID) {
    return fetch(`${this._baseUrl}/articles/${articleID}/likes`, {
      method: 'DELETE',
      headers: this._headers,
      credentials: 'include',
    })
      .then(this._checkResponse);
  }

  deleteArticle(articleID) {
    return fetch(`${this._baseUrl}/articles/${articleID}`, {
      method: 'DELETE',
      headers: this._headers,
      credentials: 'include',
    })
      .then(this._checkResponse);
  }

  // Revisions

  // Reviews
}

const api = new Api({
  baseUrl: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
