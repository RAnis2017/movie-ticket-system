import React, { useEffect } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "react-query"
import { fetchFunc } from "../utils"
import { useGoogleLogout } from "react-google-login"
const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function NavigationMenu(props) {
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

    useEffect(() => {

    }, [])

    const { isLoading: navigationsLoading, isSuccess: navigationsSuccess, data: navigations } = useQuery('navigations', () =>
        fetchFunc(`http://localhost:3001/get-navigations?hiearchy=true`, 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllNavigations'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false
        }
    )

    const navigate = useNavigate()

    const recursiveNavigationChildren = (navigations) => {
        return navigations.map((child, index) => {
            if (child.children.length > 0) {
                return (
                    <div className="dropdown dropdown-hover" key={index}>
                        <a tabIndex={index} href={`${child.data._target === 'internal' ? '/pages'+child.data.URL  : child.data.URL}`}  target={child.data._target}  className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">{child.text}</a>
                        <ul tabIndex={index} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                            {recursiveNavigationChildren(child.children)}
                        </ul>
                    </div>
                )
            }
            else {
                return (
                    <a href={`${child.data._target === 'internal' ? '/pages'+child.data.URL  : child.data.URL}`} key={index} target={child.data._target}  className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                        {child.text}
                    </a>
                )
            }
        })
    }



    return (
        <div>
            <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
                <div className="flex items-center flex-shrink-0 text-white mr-6">
                    <svg className="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z" /></svg>
                    <span className="font-semibold text-xl tracking-tight">iMovies</span>
                </div>
                <div className="block lg:hidden">
                    <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
                        <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
                    </button>
                </div>
                <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                    {
                        <div className="text-sm lg:flex-grow">
                            <a href="#now-showing" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                                Now Showing
                            </a>
                            <a href="#upcoming-movies" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                                Upcoming Movies
                            </a>
                            {
                                navigationsSuccess && navigations?.length && recursiveNavigationChildren(navigations)
                                
                            }
                        </div>
                    }
                    <div>
                        {
                            localStorage.getItem('token') ?
                            <>
                            <span className="text-white mr-4">Hello, {localStorage.getItem('username')}</span>
                            <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0" onClick={() => signOut()}>Logout</button>
                            </>
                            :
                            <>
                                <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0 mr-2">Signup</button>
                                <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0" onClick={() => navigate('/login')}>Login</button>
                            </>
                        }
                        
                    </div>
                </div>
            </nav>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        token: state.appState.token,
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavigationMenu)