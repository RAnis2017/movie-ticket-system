import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { fetchFunc } from "../utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowAltCircleRight } from "@fortawesome/free-solid-svg-icons"
import { useGoogleLogout } from "react-google-login"
import NavigationMenu from "./NavigationMenu"
import Footer from "./Footer"
const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function Visitors(props) {
    const queryClient = useQueryClient()
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

    const { isLoading: moviesLoading, isSuccess: moviesSuccess, data: movies } = useQuery('movies', () =>
        fetchFunc(`http://localhost:3001/get-upcoming-recent-movies`, 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllMovies'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data) => {
            }
        }
    )

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
                        <a tabIndex={index} href={child.data.URL} target={child.data._target}  className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">{child.text}</a>
                        <ul tabIndex={index} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                            {recursiveNavigationChildren(child.children)}
                        </ul>
                    </div>
                )
            }
            else {
                return (
                    <a href={`${child.data.URL}`} key={index} target={child.data._target}  className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                        {child.text}
                    </a>
                )
            }
        })
    }



    return (
        <div>
            <NavigationMenu />

            <div className="carousel w-full h-80">
                <div id="item1" className="carousel-item w-full">
                    <img src="/doctor-strange-digital.webp" className="w-full" />
                </div>
                <div id="item2" className="carousel-item w-full">
                    <img src="/tile.webp" className="w-full" />
                </div>
                <div id="item3" className="carousel-item w-full">
                    <img src="/static-assets-upload10738676583638815550.webp" className="w-full" />
                </div>
            </div>
            <div className="flex justify-center w-full py-2 gap-2">
                <a href="#item1" className="btn btn-xs">1</a>
                <a href="#item2" className="btn btn-xs">2</a>
                <a href="#item3" className="btn btn-xs">3</a>
            </div>

            <div className="flex flex-col mb-8">
                <div>
                    <h1 className="text-2xl ml-6 text-gray-600 font-bold">Now Showing</h1>
                </div>
                <div className="flex" id="now-showing">
                    {
                       movies?.['showingNow']?.length ? movies['showingNow'].map((movie) => (
                            <>
                                <div className="w-1/4 ml-6 mt-3 bg-white rounded-lg m-h-64 p-2 transform hover:scale-105 hover:shadow-xl transition duration-300" key={movie._id} onClick={() => navigate('/movies/'+movie.slug)}>
                                    <figure className="mb-2">
                                        <img src={`http://localhost:3001/${movie?.image_urls?.[0]}`} alt="" className="h-64 ml-auto mr-auto" />
                                    </figure>
                                    <div className="rounded-lg p-4 bg-purple-700 flex flex-col">
                                        <div>
                                            <h5 className="text-white text-2xl font-bold leading-none">
                                                {movie.title}
                                            </h5>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-lg text-white font-light">
                                                🔴 Now Showing
                                            </div>
                                            <button className="rounded-full bg-purple-900 text-white hover:bg-white hover:text-purple-900 hover:shadow-xl focus:outline-none w-10 h-10 flex ml-auto transition duration-300">
                                                <FontAwesomeIcon icon={faArrowAltCircleRight} className="text-4xl" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )) : 
                        <div className="w-full flex">
                            <div className="text-lg ml-6 text-gray-600 font-light">
                                No now showing movies found
                            </div>
                        </div>
                    }

                </div>
            </div>

            <div className="flex flex-col mb-8">
                <div>
                    <h1 className="text-2xl ml-6 text-gray-600 font-bold">Upcoming Movies</h1>
                </div>
                <div className="flex" id="upcoming-movies">
                    {
                        movies?.['upcomingMovies']?.length ? movies['upcomingMovies'].map((movie) => (
                            <>
                                <div className="w-1/4 ml-6 mt-3 bg-white rounded-lg m-h-64 p-2 transform hover:scale-105 hover:shadow-xl transition duration-300" key={movie._id} onClick={() => navigate('/movies/'+movie.slug)}>
                                    <figure className="mb-2">
                                        <img src={`http://localhost:3001/${movie?.image_urls?.[0]}`} alt="" className="h-64 ml-auto mr-auto" />
                                    </figure>
                                    <div className="rounded-lg p-4 bg-purple-700 flex flex-col">
                                        <div>
                                            <h5 className="text-white text-2xl font-bold leading-none">
                                                {movie.title}
                                            </h5>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-lg text-white font-light">
                                                🍿 Coming Soon
                                            </div>
                                            <button className="rounded-full bg-purple-900 text-white hover:bg-white hover:text-purple-900 hover:shadow-xl focus:outline-none w-10 h-10 flex ml-auto transition duration-300">
                                                <FontAwesomeIcon icon={faArrowAltCircleRight} className="text-4xl" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )) :
                        <div className="w-full flex">
                            <div className="text-lg ml-6 text-gray-600 font-light">
                                No upcoming movies found
                            </div>
                        </div>

                    }

                </div>
            </div>

            <Footer />
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

export default connect(mapStateToProps, mapDispatchToProps)(Visitors)