import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header/Header.js';
import Footer from '../Footer/Footer.js';

function Register(props) {
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
    props.onRegister(email, password);
  }
  return (
    <div className="main">
      <Header signin={false} />
      <section className="register__container">
        <h1 className="register__header">
          Registration
        </h1>
        <form
          className="login__form"
          onSubmit={handleSubmit}
        >
          <input
            className="login__input" placeholder="email"
            onChange={onEmailChange}
            value={email}
            type="email"
            required
          />
          <input
            className="login__input" placeholder="password"
            onChange={onPasswordChange}
            value={password}
            type="password"
            required
          />
          <button
            type="submit"
            className="login__button">Register
          </button>
          <Link to='./sign-in' className="registration__underbutton">Already registerd? Login</Link>
        </form>
      </section>
      <Footer />
    </div >
  )
}

export default Register;
