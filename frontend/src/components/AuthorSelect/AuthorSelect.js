import api from '../../utils/api.js';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AuthorSelect({authors, submittingAuthor, onAuthorAdd, onAuthorsChange}) {
  console.log(authors);
  const [authorToAdd, setAuthorAuthorToAdd] = useState([]);
  const [authorQuery, setAuthorQuery] = useState('');
  const organisationDictionary = []; // To track organisations of each article

  const deleteAuthor = (index) => {
    const updatedAuthors = [...authors];
    updatedAuthors.splice(index, 1);
    onAuthorsChange(updatedAuthors);
  };

  const changeOrder = (currentIndex, newIndex) => {
    const updatedAuthors = [...authors];
    const [movedAuthor] = updatedAuthors.splice(currentIndex, 1);
    updatedAuthors.splice(newIndex, 0, movedAuthor);
    onAuthorsChange(updatedAuthors);
    organisationDictionary.length = 0;
  };

  function onAuthorQueryChange(event) {
    setAuthorQuery(event.target.value);
  }

  function handleAuthorQuery(e) {
    e.preventDefault();
    if (!authorQuery) { return };
    searchAuthor(authorQuery);
  }

  function searchAuthor(authorMailorID) {
    const isEmail = authorMailorID.includes('@');
    const isAuthorID = /^[0-9]+$/.test(authorMailorID);
    if (isEmail) {
      console.log(authorMailorID);
      api
        .getAuthorByEmail(authorMailorID)
        .then(data => {
          console.log("here-email", data);
          setAuthorAuthorToAdd(data);
        })
        .catch((err) => { console.log(err) });
    };
    if (isAuthorID) {
      api
        .getAuthorInfo(authorMailorID)
        .then(data => {
          console.log("here-id");
          setAuthorAuthorToAdd(data);
        })
        .catch((err) => { console.log(err) });
    }
  };

  function addAuthor(e) {
    e.preventDefault();
    if (!authors.some(e => authorToAdd._id === e._id)) {
      onAuthorAdd(authorToAdd);
    } else { console.log('there is a user already') }
    setAuthorAuthorToAdd([]);
    setAuthorQuery([]);
  };

console.log(authors);

  return (
    <div className='author-select'>
      <label>Authors
        <p className="article-submit__field-explanation">Type author's ID or email to find and add an author. All authors should be pre-registered.</p>
        <div>
          <input
            type="text"
            placeholder="Search by Email or ID"
            value={authorQuery}
            onChange={onAuthorQueryChange}
          />
          <button type="button" className="submit-button" onClick={handleAuthorQuery}>Search</button>
        </div>
      </label>
      {
        authorToAdd.firstName &&
        <div>
          <Link to={'/authors/' + authorToAdd._id} > {authorToAdd.firstName} {authorToAdd.familyName} </Link>
          <button type="button" className="submit-button" onClick={addAuthor}>Add author</button>
        </div>
      }

      <p className="article__authors">
        {authors.map((author) => (
          <React.Fragment key={author._id}>
            <Link to={`/authors/${author._id}`}>
              {author.firstName.slice(0, 1)} {author.familyName}
            </Link>{' '}
            ({author.organisations.map((organisation, orgIndex) => {
              if (!organisationDictionary.some((e) => e.organisationID === organisation._id)) {
                organisationDictionary.push({
                  fullTitle: organisation.fullTitle,
                  organisationID: organisation._id,
                });
              }
              return orgIndex;
            }).map((orgIndex, index, arr) => (
              <React.Fragment key={orgIndex}>
                {orgIndex + 1}
                {index < arr.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
            ){' '}
          </React.Fragment>
        ))}
      </p>

      <p className="article__authors-aff">{
        organisationDictionary.map((organisation, index) => (
          index + 1 + ' - ' + organisation.fullTitle
        )).join(', ')
      }</p>
       <span className="article-submit__field-explanation">Authors can change organisations in their profiles.</span>

      <div className='author-select__area'>
        <ul className='author-select__order'>
          {authors.map((author, index) => (
            <li className='author-select__order-item' key={index}>
              <span>{author.firstName} </span>
              <span>{author.familyName} </span>
              {author._id !== submittingAuthor._id ? (
                <button onClick={() => deleteAuthor(index)}>X</button>
              ) : <span><b>You</b></span>}

              {index > 0 ? (
                <button onClick={() => changeOrder(index, index - 1)}>Up</button>
              ) : <span></span>}
              {index < authors.length - 1 ? (
                <button onClick={() => changeOrder(index, index + 1)}>Down</button>
              ) : <span></span>}
            </li>
          ))}
        </ul>
        <span className='author-select__order-remark'>You can change the author order here</span>
      </div>


    </div>
  );
};

export default AuthorSelect;
