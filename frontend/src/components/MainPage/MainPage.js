import React from 'react';
import ArticleCard from '../ArticleCard/ArticleCard.js';
import Header from '../Header/Header.js';
import Banner from './Banner/Banner.js';
import Footer from '../Footer/Footer.js';

function MainPage({ abstracts, onAbstractClick, onArticleLike, ...props }) {
  if (abstracts.length === 0) {
    return <div>Loading...</div>;
  }
  return (
    <main className="mainpage">
      <Header
        loggedIn={props.loggedIn}
        currentUser={props.currentUser}
        logout={props.logout} />
      {!props.loggedIn &&  <Banner />}
      <section className="elements page__elements-margin">
        {abstracts.map((abstract) => (<ArticleCard
          abstract={abstract}
          key={abstract.articleID}
          link={"/articles/" + abstract._id}
          name={abstract.name}
          likes={abstract.likes}
          owner={abstract.owner}
          onAbstractClick={onAbstractClick}
          onArticleLike={onArticleLike}
        />))}
      </section>
      <Footer />
    </main>
  )
}

export default MainPage;
