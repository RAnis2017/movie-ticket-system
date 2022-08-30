import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { fetchFunc } from "../utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowAltCircleRight } from "@fortawesome/free-solid-svg-icons"


function Visitors(props) {
    const queryClient = useQueryClient()

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

    const navigate = useNavigate()

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
                    <div className="text-sm lg:flex-grow">
                        <a href="#now-showing" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Now Showing
                        </a>
                        <a href="#upcoming-movies" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Upcoming Movies
                        </a>
                    </div>
                    <div>
                        <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0 mr-2">Signup</button>
                        <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">Login</button>
                    </div>
                </div>
            </nav>

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
                       movies?.['showingNow']?.length &&movies['showingNow'].map((movie) => (
                            <>
                                <div className="w-1/4 ml-6 mt-3 bg-white rounded-lg m-h-64 p-2 transform hover:scale-105 hover:shadow-xl transition duration-300" key={movie._id} onClick={() => navigate('/movies/'+movie._id)}>
                                    <figure className="mb-2">
                                        <img src="http://localhost:3001/star-wars-the-last-jedi-japanese-movie-poster-in-english.jpg" alt="" className="h-64 ml-auto mr-auto" />
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
                        ))
                    }

                </div>
            </div>

            <div className="flex flex-col mb-8">
                <div>
                    <h1 className="text-2xl ml-6 text-gray-600 font-bold">Upcoming Movies</h1>
                </div>
                <div className="flex" id="upcoming-movies">
                    {
                        movies?.['upcomingMovies']?.length && movies['upcomingMovies'].map((movie) => (
                            <>
                                <div className="w-1/4 ml-6 mt-3 bg-white rounded-lg m-h-64 p-2 transform hover:scale-105 hover:shadow-xl transition duration-300" key={movie._id} onClick={() => navigate('/movies/'+movie._id)}>
                                    <figure className="mb-2">
                                        <img src="http://localhost:3001/star-wars-the-last-jedi-japanese-movie-poster-in-english.jpg" alt="" className="h-64 ml-auto mr-auto" />
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
                        ))
                    }

                </div>
            </div>
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