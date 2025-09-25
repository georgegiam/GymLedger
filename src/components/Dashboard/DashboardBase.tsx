// libraries
import { Outlet } from "react-router-dom";

// components
import Navbar from "../Navbar/Navbar";

function DashboardBase() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default DashboardBase;
