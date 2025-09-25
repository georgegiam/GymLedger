import { useNavigate, Link } from "react-router-dom";

function BaseNavbar() {
  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            GymLedger
          </a>
        </div>
      </nav>
    </>
  );
}

export default BaseNavbar;
