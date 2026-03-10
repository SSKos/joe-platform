import React from 'react';
import Header from '../Header/Header.js';
import Footer from '../Footer/Footer.js';
import { Link } from 'react-router-dom';

function Login(props) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState();

  function onEmailChange(event) {
    setEmail(event.target.value);
  }
  function onPasswordChange(event) {
    setPassword(event.target.value);
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { return };
    props.onLogin(email, password);
  }

  return (
    <div className="main">
      <Header signin={true} />
      <section className="login__container">
        <h1 className="login__header">
          Personal area
        </h1>
        <form className="login__form" onSubmit={handleSubmit}>
          <input
            className="login__input" placeholder="email"
            value={email}
            onChange={onEmailChange}
            type="email"
            required
          />
          <input
            className="login__input" placeholder="password"
            value={password}
            onChange={onPasswordChange}
            type="password"
            required
          />
          <button
            type="submit"
            className="login__button"
          >Log in
          </button>
          <Link to='./sign-up' className="registration__underbutton">Not registerd? Register</Link>
        </form>
      </section>
      <Footer />
    </div>
  )
}

export default Login;
