import api from '../../utils/api.js';
import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import CategorySelect from "../CategorySelect/CategorySelect";
import AuthorSelect from "../AuthorSelect/AuthorSelect";

function ArticleSubmit({ articleToSubmit, selectedArticle, onSaveArticle, onSubmitArticle, loggedIn, currentUser, logout }) {
  console.log(articleToSubmit);
  const currentArticle = articleToSubmit[0];
  const [articleTitle, setTitle] = React.useState('');
  const [authorsToSubmit, setAuthorsToSubmit] = React.useState('');
  const [authorsForServer, setAuthorsForServer] = React.useState([]);
  const [abstract, setAbstract] = React.useState('');
  const [articleDoc, setArticleDocfile] = React.useState('');
  const [supplements, setSupplementary] = React.useState('');
  const [ethicStatement, setEthics] = React.useState('');
  const [conflictDisclosure, setNoconflict] = React.useState('');
  const [authorsInput, setAuthorinput] = React.useState('');
  const [articleType, setArticletype] = React.useState('');
  const [ratingByAuthor, setArticlevalue] = React.useState('');
  const [categories, setCategory] = React.useState('');

  React.useEffect(() => {
    if (!authorsToSubmit) {
      api
        .getAuthorByEmail(currentUser.email)
        .then(data => {
          setAuthorsToSubmit([data]);
        })
        .catch((err) => { console.log(err) });
    }

  }, []);

  function onTitleChange(event) {
    setTitle(event.target.value);
    console.log(articleTitle);
  }
  function prepareAuthorsForServer(authors) {
    const authorsForServerPrepare = authors.map((author) => ({
      author: author._id,
      organisations: author.organisations.map((org) => org._id),
    }));
    console.log('authorsForServerPrepare: ', authorsForServerPrepare)
    return authorsForServerPrepare;
  };
  function onAuthorAdd(newAuthor) {
    console.log(newAuthor)
    setAuthorsToSubmit([...authorsToSubmit, newAuthor]);
  }
  function onAuthorsChange(newAuthors) {
    setAuthorsToSubmit(newAuthors);
  }
  function onAbstractChange(event) {
    setAbstract(event.target.value);
  }
  function onArticleDocChange(event) {
    setArticleDocfile(event.target.value);
  }
  function onSupplementaryChange(event) {
    setSupplementary(event.target.files[0]);
  }
  function onEthicsChange(event) {
    setEthics(event.target.value);
  }
  function onNoconflictChange(event) {
    setNoconflict(event.target.value);
  }
  function onAuthorinputChange(event) {
    setAuthorinput(event.target.value);
  }
  function onArticletypeChange(event) {
    setArticletype(event.target.value);
  }
  function onArticlevalueChange(event) {
    setArticlevalue(event.target.value);
  }
  function onCategoryChange(event) {
    console.log(event);
    const categories = event.map((category) => (category.label))
    console.log(categories);
    setCategory(categories);
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!articleTitle || !authorsToSubmit || !abstract || !articleDoc || !ethicStatement || !conflictDisclosure || !authorsInput || !articleType || !ratingByAuthor || !categories) { return };
    console.log({ articleTitle, authorsToSubmit });

    const authors = prepareAuthorsForServer(authorsToSubmit);
    onSubmitArticle({ articleTitle, authors, abstract, articleDoc, supplements, ethicStatement, conflictDisclosure, authorsInput, articleType, ratingByAuthor, categories });
  }

  function handleSave(e) {
    e.preventDefault();
    // if (!articleTitle || !authors || !abstract || !articleDoc || !ethicStatement || !conflictDisclosure || !authorsInput || !articleType || !ratingByAuthor || !categories) { return };

    console.log({ articleTitle, authorsToSubmit });

    const authors = prepareAuthorsForServer(authorsToSubmit);
    const articleID = currentArticle._id;

    onSaveArticle({ articleID, articleTitle, authors, abstract, articleDoc, supplements, ethicStatement, conflictDisclosure, authorsInput, articleType, ratingByAuthor, categories });
  }
  console.log(articleToSubmit, currentArticle);
  console.log(authorsToSubmit);
  if (articleToSubmit.length === 0) {
    return <div>Loading...</div>;
  }
  return (
    <main className="mainpage">
      <Header
        loggedIn={loggedIn}
        currentUser={currentUser}
        logout={logout} />
      <section className="article-submit">
        <h2 className="article__title">Article submission</h2>
        <section className="article-submit__technical">
          <div className="article-submit__technical-element-name">Article ID: {currentArticle._id}</div>
          <div className="article-submit__technical-element-name">Article revision ID: {currentArticle.articleRevisionID}</div>
          <div className="article-submit__technical-element-name">Created: {currentArticle.createdAt.slice(0, 10)} </div>
          <div className="article-submit__technical-element-name">Last access: {currentArticle.updatedAt.slice(0, 10)} </div>
        </section>
        <h2 className="article-submit__field-explanation">Fill all the fields</h2>
        <article name="article" className="article-submit__form">
          {/* Article articleTitle */}
          <input
            type="text"
            name="articleTitle"
            className="article-submit__input article-submit__input_articleTitle"
            value={articleTitle}
            onChange={onTitleChange}
            placeholder="Article title"
            required
          />
          {/* <span className="article-submit__error-message">Please enter an article articleTitle</span> */}
          {/* Authors. Todo: paste all quthors, find automatically them */}
          {authorsToSubmit && <AuthorSelect
            onAuthorAdd={onAuthorAdd}
            onAuthorsChange={onAuthorsChange}
            submittingAuthor={currentUser}
            authors={authorsToSubmit}
          />}


          {/* Abstract */}
          <textarea type="text" name="abstract" className="article-submit__input article-submit__input_abstract"
            value={abstract}
            onChange={onAbstractChange}
            placeholder="Enter abstract here" required minLength="500" maxLength="2000"></textarea>
          {/* <span className="article-submit__error-message abstract-error">Abstract should be 500-2000 symbols</span> */}

          {/* Upload fulltext */}
          <label className="article-submit__label">Upload full text in doc(x) format
            <input type="file" name="articleDoc"
              // accept=".doc, .docx"
              value={articleDoc}
              onChange={onArticleDocChange}
              className="article-submit__fulltext article-submit__input_docx" required />
          </label>
          {/* <span className="article-submit__error-message docx-error">Upload the file</span> */}
          <label className="article-submit__checkbox-label">
            <input type="checkbox" name="nopersonaldata"
              className="article-submit__checkbox article-submit__input_nopersonaldata" required />
            <span className="article-submit__field-explanation">I confirm that I've cleared all deanonimazing data from the article text incuding author names and organisation names.</span>
          </label>
          {/* <span className="article-submit__error-message nopersonaldata-error">Confirm that there are no names in the text</span> */}
          {/* Upload supplements */}
          <label className="article-submit__label">Upload supplements file(s) except executable files
            <input type="file" name="supplement"
            // accept=".pdf, .doc, .docx, .xls, .xlsx"
             className="article-submit__checkbox article-submit__input_supplement"
              value={supplements}
              onChange={onSupplementaryChange} />
          </label>
          <label className="article-submit__checkbox-label">
            <input type="checkbox" name="nopersonaldata"
              className="article-submit__checkbox article-submit__input_nopersonaldata" required />
            <span className="article-submit__field-explanation">I confirm that I've cleared all deanonimazing data from the supplements.</span>
          </label>
          {/* Ethic statement */}
          <input type="text" name="ethicStatement" className="article-submit__input registration__input_ethicStatement"
            value={ethicStatement}
            onChange={onEthicsChange}
            placeholder="State clearly if your research was approved by ethic comitee" required />
          {/* <span className="article-submit__error-message ethicStatement-error">Confirm ethicStatement of the study. Include names and dates of the commitees and approvals</span> */}
          <input type="text" name="conflict" className="article-submit__input registration__input_conflict"
            value={conflictDisclosure}
            onChange={onNoconflictChange}
            placeholder="Conflict of interests disclosure" />
          {/* <span className="article-submit__error-message conflict-error">Conflict of interests statement</span> */}
          <input type="text" name="author-input" className="article-submit__input registration__input_author-input"
            value={authorsInput}
            onChange={onAuthorinputChange}
            placeholder="Describe input of each author, stating each author in 3 letter" />
          {/* <span className="article-submit__error-message author-input-error">Authors' input</span> */}
          {/* Article type, field, keywords etc */}
          <section className="article-submit__article-properties">
            <label className="article-submit__label">Article type
              <select name="article-type" className="article-submit__input article-submit__input_article-type"
                value={articleType}
                onChange={onArticletypeChange} size="1" required>
                <option value="unknown">---</option>
                <option value="review">Review</option>
                <option value="review">Meta analysis</option>
                <option value="original">Original research</option>
                <option value="case">Case report</option>
                <option value="idea">Idea, hypotheses</option>
              </select>
              {/* <span className="article-submit__error-message article-type-error">Choose article type</span> */}
            </label>
            <label className="article-submit__label">Article rating
              <select name="article-type" className="article-submit__input article-submit__input_article-rating"
                value={ratingByAuthor}
                onChange={onArticlevalueChange} size="1" required>
                <option value="unknown">---</option>
                <option value="breakthrough">5 - State of the art science</option>
                <option value="regular">3 - Regular research, review, case report</option>
                <option value="repeat">1 - Fair repeat, small experiment, short review, letter, opinion</option>
              </select>
              {/* <span className="article-submit__error-message article-type-error">Choose article type</span> */}
            </label>
            <CategorySelect
              onCategoryChange={onCategoryChange}
            />
          </section>

          <p className="registration__notice">After submitting your article, you will not be able to change it unless it is reviewed.</p>
          <section className="article-submit__buttons">
            <button type="submit" className="article-submit__button-save" onClick={handleSave}>Save, I'll submit later</button>
            <button type="submit" className="article-submit-button" onClick={handleSubmit}>Submit</button>
          </section>
        </article>
      </section>

      <Footer />
    </main >
  )
}

export default ArticleSubmit;
