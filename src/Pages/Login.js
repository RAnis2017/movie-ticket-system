import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import {
  GoogleSignInSuccess,
  LoginSuccessAction,
  SetTokenAction,
} from "../redux/App/app.actions"
import GoogleLogin from "react-google-login"
import { gapi } from 'gapi-script';
import { useMutation } from 'react-query'
import { useNavigate } from "react-router-dom"

const clientID = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function Login(props) {
  const { googleSignInSuccess, setTokenAction, isLoggedIn, email, token } = props
  const [emailField, setEmailField] = useState('')
  const [passwordField, setPasswordField] = useState('')
  let navigate = useNavigate();

  const { isLoading: isLoadingGoogle, isSuccess: isSuccessGoogle, mutate } = useMutation('login-google', ({email, name}) =>
     fetch('http://localhost:3001/login-google', { 
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        name
      })
     }).then(res =>
       res.json()
     ), {
      onSuccess: (data, variables, context) => {
        setTokenAction(data.token)
        localStorage.setItem('email', data.email);
        localStorage.setItem('admin', data.isAdmin);
        localStorage.setItem('username', data?.name);
        if(data.isAdmin) {
          navigate("/admin/dashboard");
        }
      }
     }
   )

  const { isLoading: isLoadingManual, isSuccess: isSuccessManual, mutate: manualLoginMutate } = useMutation('login', ({email, password}) =>
    fetch('http://localhost:3001/login', { 
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
    }).then(res =>
      res.json()
    ), {
    onSuccess: (data, variables, context) => {
      setTokenAction(data.token)
      localStorage.setItem('email', data.email);
      localStorage.setItem('admin', data.isAdmin);
      localStorage.setItem('username', data?.name);
      if(data.isAdmin) {
        navigate("/admin/dashboard");
      }
    }
    }
  )

  useEffect(() => {
    let token = localStorage.getItem('token')
    let emailL = localStorage.getItem('email')
    
    if(token) {
      setTokenAction(token)
      googleSignInSuccess(emailL)
      navigate('/admin/dashboard');
    }

    function start() {
      gapi.client.init({
        clientId: clientID,
        scope: 'email',
      });
    }

    gapi.load('client:auth2', start);
  }, []);

  const onSuccess = response => {
    console.log(response.profileObj)
    googleSignInSuccess(response.profileObj.email)
    mutate({email: response.profileObj.email, name: response.profileObj.name})
  }

  const onFailure = response => {
    console.log('Login Failure ===> ', response)
  }

  const manualLogin = () => {
    console.log('Manual Login', emailField, passwordField)
    manualLoginMutate({email: emailField, password: passwordField})
  }

  return (
    <div className="flex justify-center items-center flex-row min-h-screen bg-gradient-to-tl from-transparent via-red-300 to-violet-300">
      <div className="flex flex-col justify-center items-center  bg-white bg-opacity-20 backdrop-blur-lg rounded-xl drop-shadow-md  p-10 w-4/12">
        <div className="mb-2 p-10 text-lg text-gray-700 font-bold text-2xl ">
          Movies Booking Login
        </div>
        <div className="w-full max-w-md">
          <div className="form-control w-full max-w-md">
            <label className="label">
              <span className="label-text text-gray-700">Email</span>
            </label>
            <input type="text" placeholder="Type here" value={emailField} onChange={(e) => setEmailField((prev) => e.target.value)} className="input input-ghost w-full max-w-md" />
          </div>
          <div className="form-control w-full max-w-md">
            <label className="label">
              <span className="label-text text-gray-700">Password</span>
            </label>
            <input type="password" placeholder="Type here" value={passwordField} onChange={(e) => setPasswordField((prev) => e.target.value)}  className="input input-ghost w-full max-w-md" />
          </div>
        </div>
        <button className="btn btn-accent mt-5" onClick={() => manualLogin()}>Login</button>
        <GoogleLogin className="btn btn-ghost mt-5 text-gray-700" clientId={clientID} buttonText='Google Login' onSuccess={onSuccess} onFailure={onFailure} isSignedIn={true} cookiePolicy={'single_host_origin'}></GoogleLogin>
        {
          isLoadingGoogle || isLoadingManual ?
          <div className="text-gray-700 mt-5">Loading...</div>
          : <></>
        }
      </div>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    isLoggedIn: state.appState.isLoggedIn,
    email: state.appState.email,
    token: state.appState.token
  }
}

const mapDispatchToProps = dispatch => {
  return {
    googleSignInSuccess: (email) => dispatch(GoogleSignInSuccess(email)),
    loginSuccessAction: () => dispatch(LoginSuccessAction()),
    setTokenAction: (token) => { dispatch(SetTokenAction(token));  },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)