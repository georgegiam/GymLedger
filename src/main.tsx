import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// components
import Home from "./components/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import DashboardBase from "./components/Dashboard/DashboardBase";
import Dashboard from "./components/Dashboard/Dashboard";
import NewWorkout from "./components/NewWorkout/NewWorkout";
import History from "./components/History/History";

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
          <Route path="newWorkout" element={<NewWorkout />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>
);
