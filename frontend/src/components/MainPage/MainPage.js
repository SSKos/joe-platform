import React from 'react';
import ArticleCard from '../ArticleCard/ArticleCard.js';
import Header from '../Header/Header.js';
import Banner from './Banner/Banner.js';
import Footer from '../Footer/Footer.js';

function MainPage({ abstracts, abstractsLoading, onAbstractClick, onArticleLike, ...props }) {
  if (abstractsLoading) {
    return <div style={{padding: '48px', textAlign: 'center', color: '#64748b'}}>Loading...</div>;
  }
  if (abstracts.length === 0) {
    return (
      <main className="mainpage">
        <Header loggedIn={props.loggedIn} currentUser={props.currentUser} logout={props.logout} />
        <div style={{padding: '80px 24px', textAlign: 'center', color: '#64748b'}}>
          <p style={{fontSize: '18px', marginBottom: '8px'}}>No published articles yet.</p>
          <p style={{fontSize: '14px'}}>Be the first to submit a paper!</p>
        </div>
        <Footer />
      </main>
    );
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
