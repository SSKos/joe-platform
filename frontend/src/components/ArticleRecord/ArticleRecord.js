import React from 'react';
import { Link } from 'react-router-dom';

function ArticleRecord({ article, onPublishedRecordClick, onSubmissionClick, onRevisionHistoryClick }) {

  const articleID = article._id;
  let revisionID = [];
  if (article.revisions.length !== 0) {
    console.log(article.revisions[article.revisions.length - 1]); revisionID = article.revisions[article.revisions.length - 1]._id;
  };

  // function toggleComponent(e) {
  //   e.preventDefault();
  //   var component = document.getElementById(article._id);
  //   if (component.style.display === "none" || component.classList.contains("hidden")) {
  //     // Component is hidden, show it
  //     component.style.display = "block";
  //     component.classList.remove("hidden");
  //   } else {
  //     // Component is visible, hide it
  //     component.style.display = "none";
  //     component.classList.add("hidden");
  //   }
  // };

  function handleSubmissionClick() {
    onSubmissionClick(articleID, revisionID);
  }

  function handleRevisionHistoryClick() {
    onRevisionHistoryClick(articleID);
  }

  function handlePublishedClick() {
    onPublishedRecordClick(articleID, revisionID);
  }

  return (
    <article className="myaccount__articles-details">
      <div>{article.createdAt.slice(0, 10)}</div>

      <div>

          {(() => {
            switch (article.state) {
              case 'Submitting':
                return  <Link key={article._id} onClick={handleSubmissionClick} to={`/myaccount/articles/${article._id}/revisions`} >Continue submission
                </Link>;
              case 'Submitted':
                return 'Find reviewers';
              case 'Accepted':
                return 'Make public';
              default:
                return <Link key={article._id} onClick={handleRevisionHistoryClick} to={`/myaccount/articles/${article._id}/revisions`} >Revision history
                </Link>;
            }
          })()}
        {/* <button onClick={toggleComponent}>Revision history</button>
        <div id={article._id} className="hidden">
          <section className="article-revisions">
            <div>
              Created
            </div>
            <div>
              Last update
            </div>
          </section>
          {article.revisions.length !== 0 && article.revisions.map((revision) => (
            <section className="article-revisions">
              <div>
                {revision.createdAt.slice(0, 10)}
              </div>
              <div>
                {revision.updatedAt.slice(0, 10)}
              </div>
            </section>
          ))}
        </div> */}
      </div>

      <div>{article.state === 'Published' ?
        (<Link onClick={handlePublishedClick} to={`/articles/${article._id}/revisions/${article.revisions[article.revisions.length - 1]._id}`}>Published article</Link>) : article.state}
      </div>
      <div>{article.revisions && article.revisions.length > 0 ? article.revisions[0].articleTitle : 'No title yet'}</div>

    </article>
  )
}

export default ArticleRecord;
