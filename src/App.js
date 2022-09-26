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
import MoviesAdmin from "./Pages/MoviesAdmin";
import SettingsAdmin from "./Pages/SettingsAdmin";
import MoviesSeatSelect from "./Pages/MoviesSeatSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCog, faLockOpen, faTicket, faTicketAlt } from "@fortawesome/free-solid-svg-icons";
import Visitors from "./Pages/Visitors";
import MoviePage from "./Pages/MoviePage";
import TicketsAdmin from "./Pages/TicketsAdmin";
import TicketsImportAdmin from "./Pages/TicketsImportAdmin";

const socket = io();

const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

const AppOutlet = () => {
  const navigate = useNavigate()
  const onLogoutSuccess = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('username')
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
        <header className="sticky top-0 z-50 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl drop-shadow-md">
          <nav className="flex justify-start items-center p-4">
            <div className="flex items-center">
              <img src="https://www.gstatic.com/images/branding/product/1x/keep_48dp.png" alt="logo" className="w-8 h-8" />
              <h1 className="ml-2 font-extrabold text-transparent text-2xl bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">iMovies</h1>
            </div>
            <div className="flex items-center ml-5">
              <button className="hover:bg-gray-700 text-gray-700 hover:text-white font-bold py-2 px-4 rounded" onClick={() => navigate('/admin/dashboard')}>
                <span className="">Admin Dashboard</span>
              </button>
            </div>
          </nav>
        </header>
        <div className="w-full flex">
          <div className="w-64 sm:w-1/2 md:w-64 h-100 bg-gray-900 shadow sm:shadow-md md:shadow-lg lg:shadow-xl xl:shadow-2xl border border-gray-900">
            <div className="flex flex-col items-center mt-5 mb-5">
              <img src="https://via.placeholder.com/400x400"
                alt="alt placeholder" className="w-10 h-10 mb-2 rounded-full" />
              <span>{localStorage.getItem('username')}</span>
              <span>{localStorage.getItem('email')}</span>
            </div>
            <ul className="text-gray-400">
              <li className="block cursor-pointer p-2 hover:bg-gray-800 hover:text-gray-100">
                <a className="flex items-center" onClick={() => navigate('/admin/movies')}>
                  <FontAwesomeIcon icon={faCamera} className="w-8 p-2 bg-gray-800 rounded-full mx-2" />
                  <span>Movies</span>
                </a>
              </li>
              <li className="block cursor-pointer p-2 hover:bg-gray-800 hover:text-gray-100">
                <a className="flex items-center" onClick={() => navigate('/admin/tickets')}>
                  <FontAwesomeIcon icon={faTicket} className="w-8 p-2 bg-gray-800 rounded-full mx-2" />
                  <span>Tickets</span>
                </a>
              </li>
              <li className="block cursor-pointer p-2 hover:bg-gray-800 hover:text-gray-100">
                <a className="flex items-center" onClick={() => navigate('/admin/tickets-import')}>
                  <FontAwesomeIcon icon={faTicketAlt} className="w-8 p-2 bg-gray-800 rounded-full mx-2" />
                  <span>Tickets Import</span>
                </a>
              </li>
              <li className="block cursor-pointer p-2 hover:bg-gray-800 hover:text-gray-300">
                <a className="flex items-center" onClick={() => navigate('/admin/settings')}>
                  <FontAwesomeIcon icon={faCog} className="w-8 p-2 bg-gray-800 rounded-full mx-2" />
                  <span>Settings</span>
                </a>
              </li>
              <li className="block cursor-pointer p-2 hover:bg-gray-800 hover:text-gray-300">
                <a className="flex items-center" onClick={() => signOut()}>
                  <FontAwesomeIcon icon={faLockOpen} className="w-8 p-2 bg-gray-800 rounded-full mx-2" />
                  <span>Logout</span>
                </a>
              </li>
            </ul>
          </div>
          <main className="w-full h-full min-h-screen">
            <Outlet />
          </main>
        </div>

      </div>
    </>
  );
};

function App() {

  return (
    <Router>
      <div className="min-h-screen bg-violet-100">

        <ToastContainer limit={1} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Visitors />} />
          <Route path="/movies/:id" element={<MoviePage />} />
          <Route path="/movies/buy/:id" element={<MoviesSeatSelect />} />
          <Route element={<AppOutlet />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/movies" element={<MoviesAdmin />} />
            <Route path="admin/tickets" element={<TicketsAdmin />} />
            <Route path="admin/tickets-import" element={<TicketsImportAdmin />} />
            <Route path="admin/settings" element={<SettingsAdmin />} />
            <Route path="movies/select" element={<MoviesSeatSelect />} />
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