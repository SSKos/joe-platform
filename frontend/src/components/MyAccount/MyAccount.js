import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Link } from 'react-router-dom';
import api from "../../utils/api";
import ArticleRecord from "../ArticleRecord/ArticleRecord";

function MyAccount(props) {
  // console.log('MyAccount.js:', props);
  const [articles, setArticles] = React.useState([]);

  React.useEffect(() => {
    api
      .getMyArticles()
      .then(items => {
        setArticles(items);
      })
      .catch((err) => { console.log(err) });

  }, [])

  function handleArticleSubmit() {
    props.onArticleSubmit()
  }

  console.log(articles)

  return (
    <main className="mainpage">
      <Header
        loggedIn={props.loggedIn}
        currentUser={props.currentUser}
        logout={props.logout} />

      <section className="myaccount">
        <button className="myaccount__article-submit" onClick={handleArticleSubmit}>Start a new article</button>
      </section>
      <section className="myaccount__articles page__elements-margin">
        My articles
        <div className="myaccount__articles-details">
          <div>Created</div>
          <div>Actions</div>
          <div>State</div>
          <div>Title</div>
        </div>
        { articles.length !== 0 && articles.map((article) => (<ArticleRecord
          article={article}
          onRevisionHistoryClick={props.handleRevisionHistoryClick}
          onSubmissionClick={props.handleSubmissionDetailsClick}
          onPublishedRecordClick={props.handlePublishedArticleClick}
          key={article._id}
        />
          // <Link key={article._id} to={`/myaccount/articles/${article._id}`} className="myaccount__articles-details">
          //   <div>{article.createdAt.slice(0, 10)}</div>
          //   <div>{article.state}</div>
          //   <div>{article.state === 'Published' &&
          //   <Link target="_blank" onClick={props.handlePublishedArticleClick} to={`/articles/${article._id}/revisions/${article.revisions[article.revisions.length - 1]._id}`}>View published article</Link> }
          //   </div>
          //   <div>{article.revisions && article.revisions.length > 0 ? article.revisions[0].articleTitle : 'no revisions'}</div>
          // </Link>
        ))}
      </section>

      <Footer />
    </main>
  )
}

export default MyAccount;
