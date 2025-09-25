import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <>
      <div className="container text-center" style={{ marginTop: "10%" }}>
        <h1 style={{ fontSize: "100px" }}>401</h1>
        <h4>Forbidden</h4>
        <p>Access to this resource is denied.</p>
        <Link className="btn-primary btn mt-2" to="/">
          Go back
        </Link>
      </div>
    </>
  );
}

export default Unauthorized;
