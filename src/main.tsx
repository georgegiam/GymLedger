import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// components
import Home from "./components/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import DashboardBase from "./components/Dashboard/Dashboardbase";
import Dashboard from "./components/Dashboard/Dashboard";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboardBase"
          element={
            <PrivateRoute>
              <DashboardBase />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>
);
