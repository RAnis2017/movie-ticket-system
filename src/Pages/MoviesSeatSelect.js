import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faChair } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"
const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function MoviesSeatSelect(props) {
    const [seatsPerRow, setSeatsPerRow] = useState(0)
    const [rows, setRows] = useState(0)
    const [divideSeatsBy, setDivideSeatsBy] = useState(1)
    const [settingId, setSettingId] = useState(0)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [currentPrice, setCurrentPrice] = useState(0)
    const PRICE_PER_SEAT = 1200;

    const queryClient = useQueryClient()

    useEffect(() => {
        setCurrentPrice(selectedSeats.length * PRICE_PER_SEAT)
    }, [selectedSeats])

    const { isLoading: settingsLoading, isSuccess: settingsSuccess, data: settings } = useQuery('settings', () =>
        fetchFunc(`http://localhost:3001/get-settings/${'movie_settings_1'}`, 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllCategories'),
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
                    { seatsPerRow > 0 && getCols(i) }
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
                <button key={`col-${i}`} disabled={false} className={`flex flex-col mr-2 p-1 btn btn-circle btn-outline text-violet-700 bg-slate-100 ${selectedSeats.indexOf(`${row}-${i}`) > -1 ? 'bg-violet-700 text-slate-100' : ''}`} onClick={() => selectedSeatByCustomer(`${row}-${i}`)}>
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
            setSelectedSeats([...selectedSeats, seatNumber])
        }
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
                        <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0 mr-2">Signup</button>
                        <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0" onClick={() => navigate('/login')}>Login</button>
                    </div>
                </div>
            </nav>
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

export default connect(mapStateToProps, mapDispatchToProps)(MoviesSeatSelect)