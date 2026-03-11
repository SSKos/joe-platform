import api from '../../utils/api.js';
import React from "react";
import { useParams } from 'react-router-dom';
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import CategorySelect from "../CategorySelect/CategorySelect";

function ArticleSubmit({ articleToSubmit, onSaveArticle, loggedIn, currentUser, logout }) {
  const { articleID: articleIDFromUrl } = useParams();
  const [currentArticle, setCurrentArticle] = React.useState(
    articleToSubmit && articleToSubmit[0] ? articleToSubmit[0] : null
  );

  const [articleTitle, setTitle] = React.useState('');
  const [abstract, setAbstract] = React.useState('');
  const [articleDocUrl, setArticleDocUrl] = React.useState('');
  const [ethicStatement, setEthics] = React.useState('');
  const [conflictDisclosure, setNoconflict] = React.useState('');
  const [authorsInput, setAuthorinput] = React.useState('');
  const [articleType, setArticletype] = React.useState('');
  const [ratingByAuthor, setArticlevalue] = React.useState('');
  const [categories, setCategory] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  // If articleToSubmit wasn't pre-loaded (e.g. direct URL navigation), fetch by URL param
  React.useEffect(() => {
    if (!currentArticle && articleIDFromUrl) {
      api.getMyArticle(articleIDFromUrl)
        .then((articles) => {
          if (articles && articles[0]) setCurrentArticle(articles[0]);
        })
        .catch((err) => setError('Failed to load article: ' + err));
    }
  }, [articleIDFromUrl]);

  function onCategoryChange(event) {
    setCategory(event ? event.map((c) => c.label) : []);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!articleTitle || !abstract || !articleType || !ratingByAuthor || !conflictDisclosure || !authorsInput || !ethicStatement) {
      setError('Please fill all required fields.');
      return;
    }
    setSaving(true);
    setError('');

    const authors = currentUser && currentUser._id
      ? [{ author: currentUser._id, organisations: [] }]
      : [];

    onSaveArticle({
      articleID: currentArticle._id,
      articleTitle,
      abstract,
      articleDocUrl,
      articleType,
      ratingByAuthor: Number(ratingByAuthor),
      conflictDisclosure,
      authorsInput,
      ethicStatement,
      categories,
      authors,
    });
  }

  if (error && !currentArticle) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
  }

  if (!currentArticle) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Loading article...</div>;
  }

  return (
    <main className="mainpage">
      <Header loggedIn={loggedIn} currentUser={currentUser} logout={logout} />
      <section className="article-submit">
        <h2 className="article-submit__title">Submit an article</h2>

        <div className="article-submit__technical">
          <span className="article-submit__technical-element-name">Article ID: {currentArticle._id}</span>
          <span className="article-submit__technical-element-name" style={{ marginLeft: '24px' }}>
            Created: {currentArticle.createdAt ? currentArticle.createdAt.slice(0, 10) : '—'}
          </span>
        </div>

        {error && <p style={{ color: '#ef4444', marginTop: '8px' }}>{error}</p>}

        <article className="article-submit__form">
          <input
            type="text"
            className="article-submit__input"
            value={articleTitle}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title *"
            required
          />

          <textarea
            className="article-submit__input"
            style={{ height: '140px', padding: '10px 12px', resize: 'vertical' }}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Abstract (min 10 characters) *"
            required
          />

          <input
            type="url"
            className="article-submit__input"
            value={articleDocUrl}
            onChange={(e) => setArticleDocUrl(e.target.value)}
            placeholder="Link to full text (Google Drive, Dropbox, etc.)"
          />

          <div className="article-submit__article-properties">
            <label className="article-submit__label">Article type *
              <select
                className="article-submit__input"
                value={articleType}
                onChange={(e) => setArticletype(e.target.value)}
                required
              >
                <option value="">— select type —</option>
                <option value="original research">Original research</option>
                <option value="review">Review</option>
                <option value="meta">Meta-analysis</option>
                <option value="case report">Case report</option>
                <option value="short report">Short report</option>
                <option value="position paper">Position paper</option>
                <option value="clinical trial">Clinical trial</option>
                <option value="recommendations">Recommendations</option>
              </select>
            </label>

            <label className="article-submit__label">Self-assessed significance *
              <select
                className="article-submit__input"
                value={ratingByAuthor}
                onChange={(e) => setArticlevalue(e.target.value)}
                required
              >
                <option value="">— select —</option>
                <option value="5">5 — Major breakthrough</option>
                <option value="3">3 — Regular research</option>
                <option value="1">1 — Short report / letter</option>
              </select>
            </label>

            <label className="article-submit__label">Research categories
              <CategorySelect onCategoryChange={onCategoryChange} />
            </label>
          </div>

          <input
            type="text"
            className="article-submit__input"
            value={ethicStatement}
            onChange={(e) => setEthics(e.target.value)}
            placeholder="Ethics statement (e.g. approved by ethics committee, or N/A) *"
            required
          />

          <input
            type="text"
            className="article-submit__input"
            value={conflictDisclosure}
            onChange={(e) => setNoconflict(e.target.value)}
            placeholder="Conflict of interests (e.g. none declared) *"
            required
          />

          <input
            type="text"
            className="article-submit__input"
            value={authorsInput}
            onChange={(e) => setAuthorinput(e.target.value)}
            placeholder="Authors' contributions (e.g. J.S. — study design, data analysis) *"
            required
          />

          <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0' }}>
            After submitting you will not be able to edit the article until it passes review.
          </p>

          <section className="article-submit__buttons">
            <button
              type="button"
              className="article-submit-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Submitting...' : 'Save & Submit'}
            </button>
          </section>
        </article>
      </section>
      <Footer />
    </main>
  );
}

export default ArticleSubmit;
