import { Link } from "react-router-dom";
import BaseNavbar from "../BaseNavbar";

function Home() {
  return (
    <>
      <BaseNavbar />
      <div className="container text-center mt-5">
        <h2>Welcome to GymLedger</h2>
        <p>Track your workouts prpgress easily.</p>
        <Link className="btn-primary btn mt-2" to="/login">
          <i className="fa-solid fa-dumbbell me-2"></i> Get Started
        </Link>
      </div>
    </>
  );
}

export default Home;
