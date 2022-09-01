import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { fetchFunc } from "../utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowAltCircleRight } from "@fortawesome/free-solid-svg-icons"


function MoviePage(props) {
    const queryClient = useQueryClient()
    const params = useParams()

    useEffect(() => {

    }, [])

    const { isLoading: movieLoading, isSuccess: movieSuccess, data: movie } = useQuery('movies', () =>
        fetchFunc(`http://localhost:3001/get-movie/${params.id}`, 'GET', {
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

    const YoutubeEmbed = ({ embedId }) => (
        <div className="video-responsive" style={{
            overflow: 'hidden',
            paddingBottom: '56.25%',
            position: 'relative',
            height: 0,
        }}>
          <iframe
            width="853"
            height="480"
            style={{
                left: 0,
                top: 0,
                height: '100%',
                width: '100%',
                position: 'absolute',
            }}
            src={`https://www.youtube.com/embed/${embedId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
          />
        </div>
      );

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
                        <a onClick={() => navigate('/#now-showing')} className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Now Showing
                        </a>
                        <a onClick={() => navigate('/#upcoming-movies')} className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Upcoming Movies
                        </a>
                    </div>
                    <div>
                        <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0 mr-2">Signup</button>
                        <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0" onClick={() => navigate('/login')}>Login</button>
                    </div>
                </div>
            </nav>

            <div className="flex justify-center items-center">
                <div className="w-2/3 mt-10">
                    <div className="flex justify-start bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div className="">
                            <h1 className="text-4xl font-bold text-slate-500 mb-2">{movie?.title}</h1>
                            <div className="text-gray-500 mb-4">
                                <span>{movie?.category}</span>
                                <span className="mx-2">•</span>
                                <span>{movie?.duration ? movie?.duration : '4h 13m'}</span>
                                <span className="mx-2">•</span>
                                {
                                    movie?.release_date ?
                                    <span>{new Date(movie?.release_date).getFullYear()}</span>
                                    : <></>
                                }
                            </div>
                            <div className="flex">
                                <img src={`http://localhost:3001/${movie?.image_urls?.[0]}`} alt="movie" className="max-w-md"/>
                                <div className="mb-4 mx-4 text-gray-500">
                                    <YoutubeEmbed embedId={movie?.trailer} />
                                    <div className="tags flex mt-4">
                                        {
                                            movie?.tags?.split(',').map((tag, index) => {
                                                return (
                                                    <button key={index} className="btn btn-xs mr-2">{tag}</button>
                                                )
                                            }
                                            )
                                        }
                                    </div>
                                    {
                                        movie?.description?.length ?
                                        <div className="mt-4" dangerouslySetInnerHTML={{ __html: movie?.description }} />
                                        : ''
                                    }

                                    <div className="creator mt-2">
                                        <span className="text-xl mr-2">Director:</span>
                                        <span>{ movie?.director }</span>
                                    </div>

                                    <div className="actors mt-2">
                                        <span className="text-xl mr-2">Actors:</span>
                                        <span>{ movie?.actors }</span>
                                    </div>

                                    <button className="btn btn-sm btn-primary mt-4" onClick={() => navigate('/movies/buy/'+movie._id)}>Buy Tickets</button>
                                    
                                    <div className="tickets-count mt-4">
                                        <span className="text-xl mr-2">Tickets:</span>
                                        <span className="text-2xl animate-pulse text-red-400 font-bold">{ movie?.tickets_count ? movie?.tickets_count : 78 }</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(MoviePage)