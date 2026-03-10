// import logo from '../images/logo_mesto.svg';
import { Link, useLocation } from 'react-router-dom';

function Header(props) {
  const location = useLocation();
  return (
    <header className="header">
      <div className="">
        <Link className="header__title" to='/'>Journal of Everything</Link>
        <p className="header__subtitle">Publish and read peer-reviewed scientific papers forever FREE</p>
      </div>
      {props.loggedIn ?
        <div className="header__nav">
          <div className="header__nav_personal">
            <div className="header__author_name">{props.currentUser.firstName} {props.currentUser.familyName}</div>
            {location.pathname !== '/myaccount' && <Link className="header__link" to='/myaccount'>My account</Link>}

            <Link className="header__link" to='/' onClick={props.logout}>Exit</Link>
          </div>
        </div>
        :
        <div className="header__nav">
          {props.signin ?
          <Link className="header__link" to='/sign-up'>Register</Link>:
          <Link className="header__link" to='/sign-in'>Login</Link>}
        </div>

      }

    </header>
  )
}

export default Header;
