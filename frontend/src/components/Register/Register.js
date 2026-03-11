import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header/Header.js';
import Footer from '../Footer/Footer.js';

function Register(props) {
  const [firstName, setFirstName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!firstName || !email || !password) { return; }
    props.onRegister(firstName, email, password);
  }
  return (
    <div className="main">
      <Header signin={false} />
      <section className="register__container">
        <h1 className="login__header">
          Create account
        </h1>
        <form className="login__form" onSubmit={handleSubmit}>
          <input
            className="login__input"
            placeholder="First name"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            type="text"
            required
          />
          <input
            className="login__input"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            required
          />
          <input
            className="login__input"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            required
          />
          <button type="submit" className="login__button">Create account</button>
          <Link to='/sign-in' className="registration__underbutton">Already have an account? Log in</Link>
        </form>
      </section>
      <Footer />
    </div>
  );
}

export default Register;
