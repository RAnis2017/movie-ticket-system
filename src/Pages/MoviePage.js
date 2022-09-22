import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import {
    SetUserMovieDetailsAction
  } from "../redux/App/app.actions"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { fetchFunc } from "../utils"
import { useGoogleLogout } from "react-google-login"
const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function MoviePage(props) {
    const [userName, setUserName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [userSeats, setUserSeats] = useState(1)
    const [validations, setValidations] = useState({
        userName: true,
        userEmail: true,
        userSeats: true
    })

    const queryClient = useQueryClient()
    const params = useParams()
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

    const setMovieUserDetails = () => {
        if(userName === '' || userEmail === '' || parseInt(userSeats) < 1) {
            setValidations({
                userName: userName !== '',
                userEmail: userEmail !== '',
                userSeats: parseInt(userSeats) >= 1
            })
            return
        }
        // check if email is valid
        if(!userEmail.includes('@')) {
            setValidations({
                userName: true,
                userEmail: false,
                userSeats: true
            })
            return
        }
        props.setMovieUserDetails(params.id, userName, userEmail, userSeats)
        navigate('/movies/buy/'+movie.slug)
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
                    <div className="text-sm lg:flex-grow">
                        <a onClick={() => navigate('/#now-showing')} className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Now Showing
                        </a>
                        <a onClick={() => navigate('/#upcoming-movies')} className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                            Upcoming Movies
                        </a>
                    </div>
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
                                <img src={`http://localhost:3001/${movie?.image_urls?.[0]}`} alt="movie" className="max-w-md" />
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
                                        <span>{movie?.director}</span>
                                    </div>

                                    <div className="actors mt-2">
                                        <span className="text-xl mr-2">Actors:</span>
                                        <span>{movie?.actors}</span>
                                    </div>

                                    <label htmlFor="my-modal-5" className="btn modal-button btn-sm btn-primary mt-4" >Buy Tickets</label>
                                    <div className="tickets-count mt-4">
                                        <span className="text-xl mr-2">Tickets:</span>
                                        <span className="text-2xl animate-pulse text-red-400 font-bold">{movie?.tickets_count ? movie?.tickets_count : 78}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Code Below */}

            <input type="checkbox" id="my-modal-5" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box w-6/12 max-w-5xl bg-white">
                    <h3 className="font-bold text-lg text-black">Enter Following details to proceed</h3>
                    <div className="w-full py-4">
                        <div className="flex flex-col justify-center">
                            <div className="form-control mt-2 w-full mr-2">
                                <div className={` alert alert-error mt-2 flex flex-col items-start shadow-lg `}>
                                    <div className={`${validations.userName ?  'hidden' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>Please add your full name.</span>
                                    </div>
                                    <div className={`${validations.userSeats ?  'hidden' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>Please select 1 or more seats.</span>
                                    </div>
                                    <div className={`${validations.userEmail ?  'hidden' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>Please add a valid email address.</span>
                                    </div>
                                </div>
                                <label className="label">
                                    <span className="label-text text-black font-bold">Name</span>
                                </label>
                                <input type="text" placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} className="input text-white" />                     
                            </div>
                            <div className="form-control mt-2 w-full mr-2">
                                <label className="label">
                                    <span className="label-text text-black font-bold">Email</span>
                                </label>
                                <input type="text" placeholder={"Email"} value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="input text-white" />      
                            </div>
                            <div className="form-control mt-2 w-full">
                                <label className="label">
                                    <span className="label-text text-black font-bold">No. of Tickets</span>
                                </label>
                                <input type="number" placeholder={"No of Tickets"} min={0} value={userSeats} onChange={(e) => setUserSeats(e.target.value)} className="input text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="modal-action">
                        <label htmlFor="my-modal-5" className="btn">Close</label>

                        <button className="btn btn-success" onClick={() => setMovieUserDetails()}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        token: state.appState.token
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setMovieUserDetails: (movieId, userName, userEmail, userSeats) => dispatch(SetUserMovieDetailsAction({movieId, userName, userEmail, userSeats}))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MoviePage)