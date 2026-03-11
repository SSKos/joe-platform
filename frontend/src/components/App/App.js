import api from '../../utils/api.js';
import React from 'react';
import CurrentUserContext from "../../contexts/CurrentUserContext.js";
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute.js';
import Login from '../../components/Login/Login.js';
import Register from '../../components/Register/Register.js';
import * as auth from '../../utils/auth.js';
import { signout, checkSession } from '../../utils/auth.js';
import MainPage from '../MainPage/MainPage.js';
import ArticlePage from '../ArticlePage/ArticlePage.js';
import ArticleSubmit from '../ArticleSubmit/ArticleSubmit.js';
import MyAccount from '../MyAccount/MyAccount.js';
import RevisionHistory from '../RevisionHistory/RevisionHistory.js';

function App() {

  const history = useHistory();
  // const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  // const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  // const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  // const [isImagePopupOpen, setIsImagePopupOpen] = React.useState(false);
  // const [isCautionPopupOpen, setIsCautionPopupOpen] = React.useState(false);
  // const [isInfoTooltipOpen, setIsInfoTooltipOpen] = React.useState(false);
  const [selectedArticle, setSelectedArticle] = React.useState([]);
  const [selectedRevisionHistory, setSelectedRevisionHistory] = React.useState([]);
  const [currentUser, setCurrentUser] = React.useState({});
  const [abstracts, setAbstracts] = React.useState([]);
  // const [articleToDelete, setArticleToDelete] = React.useState({});
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [abstractsLoading, setAbstractsLoading] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [tipTitle, setTipTitle] = React.useState('');
  // const [loadFullRevisions, setLoadFullRevisions] = React.useState(false);
  const [articleToSubmit, setArticleToSubmit] = React.useState([]);
  // Restore session from HttpOnly cookie on page load
  React.useEffect(() => {
    checkSession()
      .then((res) => {
        if (res) {
          setEmail(res.email);
          setLoggedIn(true);
        }
      })
      .catch(() => {
        // No active session — user must log in
      });
  }, []);

  React.useEffect(() => {
    if (loggedIn) {
      api
        .getUserInfo()
        .then(data => {
          setCurrentUser(data);
        })
        .catch((err) => { console.log(err) });
    }

  }, [loggedIn]);

  // Initial abstracts request
  React.useEffect(() => {
    api
      .getInitialAbstracts()
      .then(abstracts => {
        setAbstracts(abstracts);
      })
      .catch((err) => { console.log(err) })
      .finally(() => { setAbstractsLoading(false); });
  }, []);


  // Page handlers

  // function handleEditAvatarClick() { setIsEditAvatarPopupOpen(true); }
  // function handleEditProfileClick() { setIsEditProfilePopupOpen(true); }
  // function handleAddPlaceClick() { setIsAddPlacePopupOpen(true); }
  function handleAbstractClick(articleID, revisionID) {
    console.log('getPublishedArticle')
    api
      .getPublishedArticle(articleID, revisionID)
      .then(article => {
        setSelectedArticle(article);
      })
      .catch((err) => { console.log(err) });

    // setIsImagePopupOpen(true);
  }

  function handleRevisionHistoryClick(articleID) {
    console.log('app: getRevisions in account', articleID)
    api
      .getMyArticle(articleID)
      .then((article) => {
        console.log(article)
        setSelectedRevisionHistory(article);
      })
      .catch((err) => { console.log(err) });
    // setIsImagePopupOpen(true);
  }

  function handleSubmissionDetailsRequest(articleID, revisionID) {
    api
      .getMyArticle(articleID, revisionID)
      .then(article => {
        setArticleToSubmit(article);
      })
      .catch((err) => { console.log(err) });

    // setIsImagePopupOpen(true);
  }

  function handleArticleStartSubmit() {
    api
      .createArticle()
      .then(article => {
        setArticleToSubmit([article]);
        history.push(`/myaccount/articles/${article._id}`);
      })
      .catch((err) => { console.log(err) });
  }

  function handleArticleSave(revision) {
    return api
      .createRevision(revision)
      .then(() => api.submitArticle(revision.articleID))
      .then(() => api.getInitialAbstracts())
      .then((freshAbstracts) => {
        setAbstracts(freshAbstracts);
        setAbstractsLoading(false);
        history.push('/');
      });
  }

  function handleArticleSubmit(article) {
    console.log(article);
    // api
    //   .createArticle()
    //   .then(article => {
    //     console.log(article)
    //     setArticleToSubmit(article);
    //   })
    //   .catch((err) => { console.log(err) });

    // setIsImagePopupOpen(true);
  }




  // // Popup handlers
  // function handleUpdateUser({ name, about }) {
  //   api
  //     .editUser({ name, about })
  //     .then(data => {
  //       setCurrentUser(data);
  //       // closeAllPopups();
  //     })
  //     .catch((err) => { console.log(err) });
  // }
  // function handleUpdateAvatar(avatar) {
  //   api
  //     .editAvatar(avatar)
  //     .then(data => {
  //       setCurrentUser(data);
  //       // closeAllPopups();
  //     })
  //     .catch((err) => { console.log(err) });
  // }
  // function handleSubmitArticle({ articleTitle, authors, affiliations, abstract, fullLink, supplements, ethicStatement, conflictDisclosure, authorsInput, articleType, ratingByAuthor, categories }) {
  //   console.log({ articleTitle, authors, affiliations, abstract, fullLink, supplements, ethicStatement, conflictDisclosure, authorsInput, articleType, ratingByAuthor, categories });
  //   api
  //     .saveArticle({ articleTitle, authors, affiliations, abstract, fullLink, supplements, ethicStatement, conflictDisclosure, authorsInput, articleType, ratingByAuthor, categories })
  //     .then(data => {
  //       setArticles([data, ...articles]);
  //       // closeAllPopups();
  //     })
  //     .catch((err) => { console.log(err) });
  // };
  // function closeAllPopups() {
  //   setIsEditAvatarPopupOpen(false);
  //   setIsEditProfilePopupOpen(false);
  //   setIsAddPlacePopupOpen(false);
  //   setIsImagePopupOpen(false);
  //   setIsCautionPopupOpen(false);
  //   setSelectedArticle({});
  // };
  // function closeRegistrationTip() {
  //   setIsInfoTooltipOpen(false);
  //   history.push('/signin');
  // };
  // Article handlers
  // function articleDelete(article) {
  //   api.deleteArticle(article._id)
  //     .then(() => {
  //       setArticles(articles => articles.filter((item) => item._id !== article._id));
  //       closeAllPopups();
  //     })
  //     .catch((err) => { console.log(err) });
  // };
  // function handleArticleCautionDelete(event) {
  //   event.preventDefault();
  //   articleDelete(articleToDelete);
  // };
  // function handleArticleLike(article) {
  //   // Снова проверяем, есть ли уже лайк на этой карточке
  //   const isLiked = article.likes.some(like => like === currentUser._id);
  //   // Отправляем запрос в API и получаем обновлённые данные карточки
  //   isLiked
  //     ? api.deleteLike(article._id)
  //       .then((refreshedArticle) => {
  //         setArticles(currentArticles => currentArticles.map(currentArticle => currentArticle._id === article._id ? refreshedArticle : currentArticle));
  //       })
  //       .catch((err) => { console.log(err) })
  //     : api.putLike(article._id)
  //       .then((refreshedArticle) => {
  //         setArticles(currentArticles => currentArticles.map(currentArticle => currentArticle._id === article._id ? refreshedArticle : currentArticle));
  //       })
  //       .catch((err) => { console.log(err) });
  // };
  // function handleArticleDelete(article) {
  //   setArticleToDelete(article);
  //   setIsCautionPopupOpen(true);
  // };

  function handleLogin(email, password) {
    auth.login(email, password)
      .then((data) => {
        if (data) {
          setEmail(email);
          setLoggedIn(true);
          history.push('/');
        }
      })
      .catch((err) => console.log(err));
  };
  // const [infoToolOk, setInfoToolOk] = React.useState(false);

  function handleRegister(firstName, email, password) {
    auth.register(firstName, email, password)
      .then(() => auth.login(email, password))
      .then(() => {
        setEmail(email);
        setLoggedIn(true);
        return api.getUserInfo();
      })
      .then((user) => {
        setCurrentUser(user);
        return api.createArticle();
      })
      .then((article) => {
        setArticleToSubmit([article]);
        history.push('/articleSubmit');
      })
      .catch(() => {
        setTipTitle("Что-то пошло не так! Попробуйте ещё раз.");
      });
  };
  function logout() {
    signout()
      .catch(() => {})
      .finally(() => {
        setLoggedIn(false);
        setCurrentUser({});
        setEmail('');
      });
  };

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="app__main">
        <Switch>
          <Route path="/sign-up">
            <Register onRegister={handleRegister} />
          </Route>
          <Route path="/sign-in">
            <Login onLogin={handleLogin} />
          </Route>
          <Route path="/articles/:articleID/revisions/:revisionID">
            {selectedArticle.length !== 0 ?
              <ArticlePage
                selectedArticle={selectedArticle}
                currentUser={currentUser}
                loggedIn={loggedIn}
                logout={logout}
              />
              : <div>Loading...</div>
            }

          </Route>
          <Route exact path="/">
            <MainPage
              abstracts={abstracts}
              abstractsLoading={abstractsLoading}
              onAbstractClick={handleAbstractClick}
              // onArticleLike={handleArticleLike}
              // selectedArticleName={selectedArticle.name}
              // selectedArticleLink={selectedArticle.link}
              currentUser={currentUser}
              loggedIn={loggedIn}
              logout={logout}
            />
          </Route>
          <Route path="/myaccount/articles/:articleID/revisions">
          {selectedRevisionHistory.length !== 0 ?
              <RevisionHistory
                selectedArticle={selectedRevisionHistory}
                currentUser={currentUser}
                loggedIn={loggedIn}
                logout={logout}
              />
              : <div>Loading...</div>
            }
            </Route>

          <ProtectedRoute
            path="/myaccount/articles/:articleID"
            component={ArticleSubmit}
            loggedIn={loggedIn}
            articleToSubmit={articleToSubmit}
            onSaveArticle={handleArticleSave}
            onSubmitArticle={handleArticleSubmit}
            currentUser={currentUser}
            logout={logout}
            email={email}
          />
          <ProtectedRoute
            path="/myaccount"
            loggedIn={loggedIn}
            component={MyAccount}
            selectedArticle={selectedArticle}
            currentUser={currentUser}
            onArticleSubmit={handleArticleStartSubmit}
            handleRevisionHistoryClick={handleRevisionHistoryClick}
            handleSubmissionDetailsClick={handleSubmissionDetailsRequest}
            handlePublishedArticleClick={handleAbstractClick}
            logout={logout}
            email={email}
          />
          <ProtectedRoute
            path="/articleSubmit"
            articleToSubmit={articleToSubmit}
            onSaveArticle={handleArticleSave}
            onSubmitArticle={handleArticleSubmit}
            loggedIn={loggedIn}
            component={ArticleSubmit}
            currentUser={currentUser}
            logout={logout}
            email={email}
          />
          <Redirect from="*" to="/" />
        </Switch>


      </div>
    </CurrentUserContext.Provider >
  );
}

export default App;
