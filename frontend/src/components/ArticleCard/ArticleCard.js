import React from 'react';
import trash from '../../images/trash.svg';
import currentUserContext from '../../contexts/CurrentUserContext.js';
import { Link } from 'react-router-dom';

function Abstract({ abstract, onAbstractClick, likes, owner, onArticleLike, onArticleDelete }) {
  const currentUser = React.useContext(currentUserContext);
  const isOwn = owner === currentUser._id;
  const articleDeleteButtonClassName = (
    `elements__delete-button ${isOwn ? 'elements__delete-button_visible' : 'elements__delete-button_hidden'}`
  );
  const isLiked = likes.some(like => like === currentUser._id);
  const articleLikeButtonClassName = `elements__like ${isLiked ? 'elements__like_active' : ''}`;
  const articleID = abstract.articleID;
  const revisionID = abstract.revisionID;

  function handleClick() {
    onAbstractClick( articleID, revisionID );
  }

  function handleLikeClick() {
    onArticleLike(abstract);
  }

  function handleArticleDelete() {
    onArticleDelete(abstract);
  }

  const organisationDictionary = []; // To track organisations of each article

  return (
    <article className="card">
      <div className="card__contents">
        <div className="card__header">
          <p className="card__article-type">{abstract.articleType}</p>
          <p className="card__article-date">
            {abstract.articlePublicationDate
              ? abstract.articlePublicationDate.toString().slice(0, 10)
              : abstract.articleState}
          </p>
        </div>
        <Link className="card__link" onClick={handleClick} to={`/articles/${abstract.articleID}/revisions/${abstract.revisionID}`}>
          <img className="card__image" alt="" src="#"></img>
          <h2 className="card__title">{abstract.articleTitle}</h2>
        </Link>
        <p className="card__authors">
          {abstract.authors.map((author, index) => (
            <React.Fragment key={author.author._id}>
              <Link to={`/authors/${author.author._id}`}>
                {author.author.firstName}{author.author.familyName ? ` ${author.author.familyName}` : ''}
              </Link>{' '}
              ({author.organisations.map((organisation) => {
                if (!organisationDictionary.some(e => e.organisationID === organisation._id)) {
                  // New organisation found, add and store it
                  organisationDictionary.push({
                    fullTitle: organisation.fullTitle,
                    organisationID: organisation._id,
                  })
                }
                console.log(author.author.familyName, organisationDictionary);
                return (
                  <React.Fragment key={organisation._id}>
                    {organisationDictionary.findIndex(e => e.organisationID === organisation._id) + 1}
                  </React.Fragment>
                );
              })}
              ){' '}
            </React.Fragment>
          ))}
        </p>
        <p className="card__authors-aff">{
          organisationDictionary.map((organisation, index) => (
            index + 1 + ' - ' + organisation.fullTitle
          ))
        } </p>
        <p className="card__text">{abstract.abstract}</p>
        {/* <div className="elements__element">
            <button
              type="button"
              className={articleDeleteButtonClassName}
              onClick={handleArticleDelete}>
              <img className="" src={trash} alt="Удалить" />
            </button>
            <div className="elements__footer">
              <div className="elements__like-section">
                <button type="button" className={articleLikeButtonClassName} onClick={handleLikeClick}></button>
                <span className="elements__num-like">{likes.length}</span>
              </div>
            </div>
          </div> */}
      </div>
    </article>
  )
}

export default Abstract;
