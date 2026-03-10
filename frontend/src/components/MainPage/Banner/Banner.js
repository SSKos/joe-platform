// import logo from '../images/logo_mesto.svg';
import { Link } from 'react-router-dom';

function Banner(props) {
  return (
    <section className="banner">
      {props.loggedIn ?
        <div className="banner__nav">
          <div className="banner__email">{props.email}</div>
          <Link className="banner__link" to='/sign-in' onClick={props.logout}>Exit</Link>
        </div>
        :
        <div className="banner__overlay">
          <h1 className="banner__title">Journal of Everything</h1>
          <p className="banner__subtitle">Publish and read peer-reviewed scientific papers forever FREE.</p>
          <Link to='./sign-in'>
          <button type="button" className="banner__login-button">Login to publish</button>
          </Link>

          <p className="banner__subtitle">or scroll to read</p>
        </div>
        // props.signin ?
        //   <Link className="banner__link" to='./sign-up'>Register</Link> :
        //   <Link className="banner__link" to='./sign-in'>Login</Link>
      }

    </section>
  )
}

export default Banner;
