import {React} from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css"


import Home from "./pages/Home";

import LoginPage from "./pages/Auth/Login";
import ResetPassword from "./pages/Auth/ResetPassword";
import Register from "./pages/Auth/Register";

import { DepartmentProvider } from './context/DepartmentContext';
import DepartmentList from "./pages/Departments/DepartmentList";

import { CompanyProvider } from './context/CompanyContext';
import CompanyList from "./pages/Companies/CompanyList";

import { MeetProvider } from './context/MeetContext';
import MeetList from "./pages/Meets/MeetList";

import SideBarLayout from "./layouts/SideBarLayout";
import AuthLayout from "./layouts/AuthLayout";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} theme="colored" newestOnTop stacked />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<SideBarLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/department-list" element={<DepartmentProvider><DepartmentList /></DepartmentProvider> } />
          <Route path="/company-list" element={<CompanyProvider><CompanyList /> </CompanyProvider>} />
          <Route path="/meet-list" element={<MeetProvider><MeetList /> </MeetProvider>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
