import { useNavigate, Link } from "react-router-dom";

function Home() {
  return (
    <>
      <div>Welcome</div>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </>
  );
}

export default Home;
