import React from "react";
import Header from '../Header/Header.js';
import Footer from '../Footer/Footer.js';
import { Link, useLocation } from 'react-router-dom';

function RevisionHistory(props) {
  const location = useLocation();
  const article = props.selectedArticle[0];
  const revisions = article.revisions
  const revision = revisions[revisions.length - 1];
  const supplementLinks = revision.supplements;
  const organisationDictionary = []; // To track organisations of each article

  console.log('revision history', revision);

  return (
    <main className="mainpage">
      <Header
        loggedIn={props.loggedIn}
        currentUser={props.currentUser}
        logout={props.logout} />
      <section className="article">
        <section className="articleTechnical">
          <p className="articleTechnical__element-name">Article ID: <span className="articleTechnical__element-data">{article._id}</span></p>
          <p className="articleTechnical__element-name">Article type: <span className="articleTechnical__element-data">{revision.articleType}</span></p>
          <p className="articleTechnical__element-name">Created: <span className="articleTechnical__element-data">{article.createdAt.slice(0, 10)}</span></p>
          <p className="articleTechnical__element-name">Updated: <span className="articleTechnical__element-data">{article.updatedAt.slice(0, 10)}</span></p>
        </section>
        <section>
          <h2 className="article__title">{revision.articleTitle}</h2>
          <p className="article__authors">{revision.authors.map((author, index) => (
            <React.Fragment key={author.author._id}>
              <Link to={`/authors/${author.author._id}`}>
                {author.author.firstName.slice(0, 1)} {author.author.familyName}
              </Link>{' '}
              ({author.organisations.map((organisation) => {
                if (!organisationDictionary.some(e => e.organisationID === organisation._id)) {
                  // New organisation found, add and store it
                  organisationDictionary.push({
                    fullTitle: organisation.fullTitle,
                    organisationID: organisation._id,
                  })
                }
                return (
                  <React.Fragment key={organisation._id}>
                    {organisationDictionary.findIndex(e => e.organisationID === organisation._id) + 1}
                  </React.Fragment>
                );
              })}
              ){' '}
            </React.Fragment>
          ))}</p>
          <p className="article__authors-aff">{
            organisationDictionary.map((organisation, index) => (
              index + 1 + ' - ' + organisation.fullTitle
            ))
          }</p>
          {/* <h3>Abstract</h3>
          <p className="article__abstract">{revision.abstract}</p> */}
        </section>
        <article className="article__content">
          {/* <section className="article__text">
            {binaryData && <PdfEmbed binaryData={binaryData} />}
          </section> */}
          <section className="article__adds">
            {/* <h3>Supplementary materials</h3>
            {/* <figure className="article__figures">

                <figcaption>Figure 1. Description of TIRR interactions</figcaption>
            </figure>
            <div className="article__suppl">
              {supplements.map((supplement, index) => (
                <React.Fragment key={index}>
                  <a
                    className="supplementLink"
                    href={supplement.link}
                    download={supplement.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {index + 1} - {supplement.name}
                  </a>
                </React.Fragment>))}
            </div> */}
            <section className="article__additional">
              <div>
                <p className="article__additional-name">Authors' input: <span className="article__additional-data">{revision.authorsInput}</span></p>
              </div>
              <div>
                <p className="article__additional-name">Categories(keywords): <span className="article__additional-data">{revision.categories}</span></p>
              </div>
              <div>
                <p className="article__additional-name">Conflict of interests: <span className="article__additional-data">{revision.conflictDisclosure}</span></p>
              </div>
              <div>
                <p className="article__additional-name">Ethic statement: <span className="article__additional-data">{revision.ethicStatement}</span></p>
              </div>
              <div>
                <p className="article__additional-name">Rating assigned by authors: <span className="article__additional-data">{revision.ratingByAuthor}</span></p>
              </div>
            </section>
            <section className="article__revision-history">
              <h3>Revision history</h3>
              <p>
                This article has {article.revisions.length - 1} revisions.
                Check the full <Link to={location.pathname + '/full'}>revision history</Link>.
              </p>
              {props.revisionsFull &&
                <section className="article__revisions-full">

                </section>
              }
            </section>
          </section>
        </article>
      </section>
      <Footer />
    </main>
  )
}

export default RevisionHistory;
