import React, { useEffect, useState } from "react"
import "./App.css"
import { connect } from "react-redux"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useNavigate
} from "react-router-dom";
import { useQuery } from 'react-query'
import Login from "./Pages/Login";
import AdminDashboard from "./Pages/AdminDashboard";
import { fetchFunc } from './utils';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGoogleLogout } from "react-google-login";
import io from 'socket.io-client';
const socket = io();

const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

const AppOutlet = () => {
  const navigate = useNavigate()
  const onLogoutSuccess = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('admin')
    navigate('/')
  }

  const onFailure = (error) => {
    console.log(error)
  }

  const { signOut } = useGoogleLogout({
    clientId,
    onLogoutSuccess,
    onFailure,
  })

  return (
    <>
      <div>
        <header className="sticky top-0 z-50 bg-gray-800">
          <nav className="flex justify-start items-center p-4">
            <div className="flex items-center">
              <img src="https://www.gstatic.com/images/branding/product/1x/keep_48dp.png" alt="logo" className="w-8 h-8" />
              <h1 className="ml-2 text-2xl font-bold">React Movies Booking</h1>
            </div>
            <div className="flex items-center ml-5">
                <button className="hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigate('/admin/dashboard')}>
                  <span className="">Admin Dashboard</span>
                </button>
            </div>
            <div className="flex items-center ml-auto">
              <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={() => signOut()}>
                <span className="">Logout</span>
              </button>
            </div>
          </nav>
        </header>
        <main className="my-20">
          <Outlet />
        </main>
        {/* <footer class="fixed inset-x-0 bottom-0 bg-gray-800">
          <div className="flex justify-center items-center h-full">
            <span className="text-white text-center m-5">React CMS</span>
          </div>
        </footer> */}
      </div>
    </>
  );
};

function App( ) {

  return (
    <Router>
      <div className="min-h-screen">

        <ToastContainer limit={1} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<AppOutlet />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>

      </div>
    </Router>
  )
}

const mapStateToProps = state => {
  return {
    isLoggedIn: state.appState.isLoggedIn,
    email: state.appState.email,
    token: state.appState.token,
  }
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)