import React, { useState, useEffect, useRef } from "react"
import { connect } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faChair } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"
import { useGoogleLogout } from "react-google-login"
import party from "party-js";

const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function MoviesSeatSelect(props) {
    const [seatsPerRow, setSeatsPerRow] = useState(0)
    const [rows, setRows] = useState(0)
    const [divideSeatsBy, setDivideSeatsBy] = useState(1)
    const [settingId, setSettingId] = useState(0)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [disabledSeats, setDisabledSeats] = useState([])
    const [currentPrice, setCurrentPrice] = useState(0)
    const [ticketSuccess, setTicketSuccess] = useState(false)
    const [location, setLocation] = useState({
        lat: null,
        lng: null
    })
    const [showLocationError, setShowLocationError] = useState(false)

    const partyPop = useRef(null)

    const PRICE_PER_SEAT = 1200;

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
        getLocation()
    }, [])

    useEffect(() => {
        setCurrentPrice(selectedSeats.length * PRICE_PER_SEAT)
    }, [selectedSeats])

    const { isLoading: settingsLoading, isSuccess: settingsSuccess, data: settings } = useQuery('settings', () =>
        fetchFunc(`http://localhost:3001/get-settings/${'movie_settings_1'}`, 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllSettings'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data, variables, context) => {
                setSettingId(data._id)
                setSeatsPerRow(data.seats_per_row)
                setRows(data.rows)
                setDivideSeatsBy(data.divide_seats_by)
            }
        }
    )

    const { isLoading: ticketsLoading, isSuccess: ticketsSuccess, data: tickets } = useQuery('tickets', () =>
        fetchFunc(`http://localhost:3001/get-tickets/${params.id}`, 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllTickets'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data, variables, context) => {
                if(data.tickets.length > 0) {
                    const seats =  []
                    data.tickets.map(ticket => {
                        ticket.seats.map(seat => {
                            seats.push(seat)
                        })
                    })
                    setDisabledSeats(seats)
                }
            }
        }
    )

    const { mutate: createTickets, isLoading: ticketLoading } = useMutation('create-tickets', (data) =>
        fetchFunc(`http://localhost:3001/create-tickets`, 'POST', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, JSON.stringify(data), navigate, 'createTickets'),
        {
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries('tickets')
                setTicketSuccess(true)
                party.confetti(partyPop.current);
                // navigate('/movies/'+params.id)
            }
        }
    )

    const navigate = useNavigate()
    const alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

    const getRows = () => {
        const returnRows = []
        for (let i = 0; i < rows; i++) {
            returnRows.push(
                <div key={`row-${i}`} className="flex items-center mt-5">
                    <div className=" mr-5 text-violet-700 font-black">
                        <h1>{alphabets[i]}</h1>
                    </div>
                    {seatsPerRow > 0 && getCols(i)}
                </div>
            )
        }

        return returnRows
    }

    const getCols = (row) => {
        const cols = []
        const afterDivide = seatsPerRow / (divideSeatsBy > 0 ? divideSeatsBy : 1)
        for (let i = 1; i <= seatsPerRow; i++) {
            cols.push(
                <button key={`col-${i}`} disabled={disabledSeats.indexOf(`${row}-${i}`) > -1} className={`flex flex-col mr-2 p-1 btn btn-circle btn-outline text-violet-700 bg-slate-100 disabled:text-white disabled:bg-slate-400 ${selectedSeats.indexOf(`${row}-${i}`) > -1 ? 'bg-violet-700 text-slate-100' : ''}`} onClick={() => selectedSeatByCustomer(`${row}-${i}`)}>
                    <FontAwesomeIcon icon={faChair} />
                    <span className="text-center">{i}</span>
                </button>
            )
            if (i % Math.ceil(afterDivide) === 0) {
                cols.push(<div key={`divider-${i}`} className="mr-10"></div>)
            }
        }

        return cols
    }

    const selectedSeatByCustomer = (seatNumber) => {
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber))
        } else {
            if (selectedSeats.length !== parseInt(props.userMovieDetails.userSeats)) {
                setSelectedSeats([...selectedSeats, seatNumber])
            }
        }
    }

    const bookSeats = () => {

        if(location.lat === null || location.lng === null) {
            setShowLocationError(true)
            return
        }

        const data = {
            seats: selectedSeats,
            movieID: props.userMovieDetails.movieId,
            Name: props.userMovieDetails.userName,
            Email: props.userMovieDetails.userEmail,
            seats_count: props.userMovieDetails.userSeats,
            total_price: currentPrice,
            latitude: location.lat,
            longitude: location.lng,
        }

        createTickets(data)
    }

    const getLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            setLocation({lat, lng})
          });
        } else {
          setLocation({lat: null, lng: null});
          showLocationError(true)
        }
      }

    const downloadTickets = () => {
        console.log('download')
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
            <div >
                <div className="flex flex-col items-center justify-center">
                <div className={`w-1/2 alert alert-error mt-2 shadow-lg ${!showLocationError ?  'hidden' : ''}`}>
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Please enable location. Required to proceed.</span>
                    </div>
                </div>
                </div>
                <div className="flex items-center justify-center mt-2 text-black">
                        <span className="w-10 h-10 bg-slate-400 rounded-full border-white border-2"></span>
                        <span className="ml-2">Booked (Not Available)</span>

                        <span className="w-10 h-10 bg-white rounded-full border-2 border-violet-700 ml-6"></span>
                        <span className="ml-2">Available</span>

                        <span className="w-10 h-10 bg-violet-700 rounded-full border-white border-2 ml-6"></span>
                        <span className="ml-2">Selected</span>

                        <span className="w-10 h-10 bg-teal-600 rounded-full border-2 border-white ml-6"></span>
                        <span className="ml-2">Being Picked</span>
                </div>
                {/* <div>
                    {
                        location.lat && location.lng ?
                        <h1>Location Latitude: { location.lat }, Location Longitude: { location.lng }</h1>
                        :
                        <></>
                    }
                    
                </div> */}
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col overflow-x-auto max-w-6xl">
                    {
                        rows > 0 && getRows(rows)
                    }
                </div>
            </div>
            <div className="flex justify-center mt-5 px-5">
                <h1 className="text-2xl mr-2 text-gray-600">Total Price:</h1>
                <h1 className="text-2xl text-blue-500">Rs {currentPrice}</h1>
            </div>
            <div className="flex justify-center mt-5 px-5">
                {
                    ticketLoading === false ?
                    props.userMovieDetails && parseInt(props.userMovieDetails.userSeats) === selectedSeats.length ?
                        <button className="btn btn-primary ml-5" onClick={() => bookSeats()}>Book Seats</button>
                        :
                        <button className="btn btn-primary ml-5 disabled:text-white" disabled>Book Seats</button>
                    :
                    <button className="btn btn-primary ml-5 disabled:text-white" disabled>Booking...</button>
                }
            </div>
            
            <input type="checkbox" id="my-modal-5" className="modal-toggle" />
            <div className={`modal ${ticketSuccess ? 'modal-open' : ''}`}>
                <div className="modal-box w-6/12 max-w-5xl bg-white flex justify-center items-center flex-col">
                    <h3 className="text-3xl text-purple-600 font-bold">Congrats!</h3>
                    <h3 className="font-bold text-lg text-black mt-2" ref={partyPop}>Your <span className="underline text-blue-600">{props.userMovieDetails.userSeats}</span> Ticket/s for <span className="underline text-blue-600">{tickets?.movie?.title}</span> has been Booked!</h3>
                    <div className="modal-action">
                        <button className="btn btn-success" onClick={() => downloadTickets()}>Download Tickets</button>
                        <button className="btn" onClick={() => setTicketSuccess(false)}>Close</button>
                    </div>
                    <h3 className="mt-2 underline">Please Download Tickets Before Closing This Alert!</h3>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        token: state.appState.token,
        userMovieDetails: state.appState.userMovieDetails
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MoviesSeatSelect)