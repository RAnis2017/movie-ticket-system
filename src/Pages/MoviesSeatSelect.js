import React, { useState, useEffect, useRef } from "react"
import { connect } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faChair } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"
import { useGoogleLogout } from "react-google-login"
import party from "party-js";
import { io } from "socket.io-client"
import {
    SetUserMovieDetailsAction
  } from "../redux/App/app.actions"
import Countdown from 'react-countdown';
import NavigationMenu from "./NavigationMenu"

const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'
const socket = io('http://localhost:3001');

function MoviesSeatSelect(props) {
    const [seatsPerRow, setSeatsPerRow] = useState(0)
    const [rows, setRows] = useState(0)
    const [divideSeatsBy, setDivideSeatsBy] = useState(1)
    const [settingId, setSettingId] = useState(0)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [disabledSeats, setDisabledSeats] = useState([])
    const [pickedSeats, setPickedSeats] = useState([])
    const [currentPrice, setCurrentPrice] = useState(0)
    const [ticketSuccess, setTicketSuccess] = useState(false)
    const [location, setLocation] = useState({
        lat: null,
        lng: null
    })
    const [showLocationError, setShowLocationError] = useState(false)
    const [pdfUrl, setPdfUrl] = useState("")
    const [uniqueId, setUniqueId] = useState("")
    const [seatsBought, setSeatsBought] = useState(0)
    const [timerRanOut, setTimerRanOut] = useState(false)
    const [showTimer, setShowTimer] = useState(false)

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
        console.log("userMovieDetails", props.userMovieDetails)
        getLocation()
        socket.on('connection', payload => {
            const { clientId } = payload
            console.log('client connected: ', clientId)
            setUniqueId(clientId)

            socket.emit('request-seats', {})
        });

        socket.on('ticket-selected', payload => {
            if (payload.uniqueId !== uniqueId) {
                setPickedSeats(prev => [...prev, {seatNumber: payload.seatNumber, uniqueId: payload.uniqueId }])                
            }
        });

        socket.on('ticket-deselected', payload => {
            if (payload.uniqueId !== uniqueId) {
                setPickedSeats(prev => prev.filter(seat => seat.seatNumber !== payload.seatNumber))
            }
        });

        socket.on('disconnect-without-buy', payload => {
            if (payload.uniqueId !== uniqueId) {
                setPickedSeats(prev => prev.filter(seat => seat.seatNumber !== payload.seatNumber && seat.uniqueId !== payload.uniqueId))
            }
        });

        setTimeout(() => {
            setShowTimer(true)
        }, 1000)

        return () => {
            if(pdfUrl === ""){
                socket.emit('disconnect-without-buy', { uniqueId })
            }
            socket.disconnect()
        }
    }, [])

    socket.on('sync-seats', payload => {
        console.log('sync-seats', payload)
        console.log('selectedSeats', selectedSeats)
        selectedSeats.map(seat => {
            socket.emit('ticket-selected', { seatNumber: seat, movieId: params.id, uniqueId })
        })
    });

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
                setSelectedSeats([])
                setSeatsBought(data._doc.seats_count)
                party.confetti(partyPop.current);
                if(data?.pdf) {
                    setPdfUrl(data.pdf)
                }
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
        const pickedSeatsArr = pickedSeats.map(seat => seat.seatNumber)
        for (let i = 1; i <= seatsPerRow; i++) {
            cols.push(
                <button key={`col-${i}`} disabled={disabledSeats.indexOf(`${row}-${i}`) > -1 || pickedSeatsArr.indexOf(`${row}-${i}`) > -1} className={`flex flex-col mr-2 p-1 btn btn-circle btn-outline text-violet-700 bg-slate-100 disabled:text-white ${pickedSeatsArr.indexOf(`${row}-${i}`) > -1 ? 'disabled:bg-teal-600' : 'disabled:bg-slate-400'}  ${selectedSeats.indexOf(`${row}-${i}`) > -1 ? 'bg-violet-700 text-slate-100' : ''}`} onClick={() => selectedSeatByCustomer(`${row}-${i}`)}>
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
            socket.emit('ticket-deselected', { seatNumber, movieId: params.id, uniqueId })
        } else {
            if (selectedSeats.length !== parseInt(props.userMovieDetails.userSeats)) {
                setSelectedSeats([...selectedSeats, seatNumber])
                socket.emit('ticket-selected', { seatNumber, movieId: params.id, uniqueId })
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

        // decrease seats amount
        const newSeats = parseInt(props.userMovieDetails.userSeats) - selectedSeats.length
        props.setMovieUserDetails(props.userMovieDetails.movieId, props.userMovieDetails.userName, props.userMovieDetails.userEmail, newSeats)

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
        const link = document.createElement('a');
        link.href = 'http://localhost:3001/'+pdfUrl;
        link.setAttribute('target', '_blank');
        link.setAttribute('download', 'tickets.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }

    const renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
          // Render a completed state
          setSelectedSeats([])
          socket.emit('disconnect-without-buy', { uniqueId })
          return setTimerRanOut(true);
        } else {
          // Render a countdown
          return <span className="text-2xl w-16">{minutes}:{seconds}</span>;
        }
      };

    return (
        <div>
            <NavigationMenu />
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

                        {
                            timerRanOut === false && showTimer ?
                            <div className="tooltip tooltip-open tooltip-right tooltip-primary" data-tip="Seats will be cleared on timer end!">
                                <div className="w-20 ml-8 bg-sky-500 text-white rounded-xl p-1 text-center shadow-lg backdrop-blur-lg border-white border-2">
                                    <Countdown date={Date.now() + 60000 * 5} renderer={renderer} className="absolute" />
                                </div>
                            </div>
                             : <></>
                        }
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
                    props.userMovieDetails && parseInt(props.userMovieDetails.userSeats) === selectedSeats.length && parseInt(props.userMovieDetails.userSeats) !== 0 ?
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
                    <h3 className="font-bold text-lg text-black mt-2" ref={partyPop}>Your <span className="underline text-blue-600">{seatsBought}</span> Ticket/s for <span className="underline text-blue-600">{tickets?.movie?.title}</span> has been Booked!</h3>
                    <div className="modal-action">
                        <button className="btn btn-success" onClick={() => downloadTickets()}>Download Tickets</button>
                        <button className="btn" onClick={() => {setTicketSuccess(false); navigate('/')}}>Close</button>
                    </div>
                    <h3 className="mt-2 underline">Please Download Tickets Before Closing This Alert!</h3>
                </div>
            </div>

            <div className={`modal ${timerRanOut ? 'modal-open' : ''}`}>
                <div className="modal-box w-6/12 max-w-5xl bg-white flex justify-center items-center flex-col">
                    <h3 className="text-3xl text-purple-600 font-bold">Sorry!</h3>
                    <h3 className="font-bold text-lg text-black mt-2">Your timer ran out. You need to pick the seats before the timer runs out! Please select again.</h3>
                    <div className="modal-action">
                        <button className="btn" onClick={() => {setTimerRanOut(false)}}>Close</button>
                    </div>
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
        setMovieUserDetails: (movieId, userName, userEmail, userSeats) => dispatch(SetUserMovieDetailsAction({movieId, userName, userEmail, userSeats}))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MoviesSeatSelect)