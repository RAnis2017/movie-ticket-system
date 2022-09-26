import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import 'react-quill/dist/quill.snow.css';
import { fetchFunc } from "../utils"
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import moment from "moment"

const fileTypes = ["JPG", "PNG", "GIF"];
const headers = ['ID', 'Name', 'Email', 'seats_count', 'movie', 'seats', 'total_price', 'created_date', 'latitude', 'longitude', 'ticket_pdf']

// dynamic table component
const Table = ({ data }) => {
    return (
        <>
            <table className="table table-striped relative z-0 text-white w-full">
                <thead className="">
                    <tr>
                        <th className="sticky top-0">Email</th>
                        <th className="sticky top-0">Name</th>
                        <th className="sticky top-0">Created Date</th>
                        <th className="sticky top-0">Movie</th>
                        <th className="sticky top-0">Seats</th>
                        <th className="sticky top-0">Seats #</th>
                        <th className="sticky top-0">Total</th>
                    </tr>
                </thead>
                <tbody className="">
                    {data?.length && data?.map(item => (
                        <tr key={item._id}>
                            <td className="truncate" title={item.Email}>{item.Email}</td>
                            <td className="truncate" title={item.Name}>{item.Name}</td>
                            <td className="truncate" title={item.created_date}>{item.created_date.split('T')[0]}</td>
                            <td className="truncate" title={item.movie.title}>{item.movie.title}</td>
                            <td className="truncate" title={item.seats.join(',')}>{item.seats.join(',')}</td>
                            <td className="truncate" title={item.seats_count}>{item.seats_count}</td>
                            <td className="truncate" title={item.total_price}>Rs {item.total_price}</td>
                        </tr>
                    ))
                    }
                </tbody>
            </table>

            {
                !data || !data?.length || data?.length === 0 ?
                    <div className="text-center m-5">
                        <h3 className="">No data found</h3>
                    </div> : <></>
            }
        </>
    )
}

function TicketsImportAdmin(props) {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [importing, setImporting] = useState(false)
    const [foundHeaders, setFoundHeaders] = useState([])
    const [mapHeaders, setMapHeaders] = useState({
        ID: '',
        Email: '',
        Name: '',
        movie: '',
        seats: '',
        seats_count: '',
        total_price: '',
        created_date: '',
        longitude: '',
        latitude: '',
        ticket_pdf: '',
    })
    const [csvData, setCsvData] = useState([])

    useEffect(() => {
        if (!props.token) {
            const isAdmin = localStorage.getItem('isAdmin')
            if (!isAdmin) {
                navigate("/login")
            }
        }
    }, [])

    const downloadFile = ({ data, fileName, fileType }) => {
        // Create a blob with the data we want to download as a file
        const blob = new Blob([data], { type: fileType })
        // Create an anchor element and dispatch a click event on it
        // to trigger a download
        const a = document.createElement('a')
        a.download = fileName
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
    }

    const { mutate: ticketsExport } = useMutation('tickets', () =>
        fetchFunc('http://localhost:3001/admin/get-tickets', 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'getAllTickets'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data) => {
                const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

                const csv = []
                csv.push(headers)
                data.tickets.forEach((ticket) => {
                    let seats = ticket.seats.map((seat) => `${alphabets[seat.split('-')[0]]}${seat.split('-')[1]}`).join(' | ')
                    csv.push([ticket._id, ticket.Name, ticket.Email, ticket.seats_count, ticket.movie.title, seats, ticket.total_price, new Date(ticket.created_date).toLocaleDateString(), ticket.latitude, ticket.longitude, ticket.ticket_pdf])
                })

                const csvString = csv.map((row) => row.join(',')).join('\n')
                downloadFile({
                    data: csvString,
                    fileName: 'tickets.csv',
                    fileType: 'text/csv',
                })
            }
        }
    )

    const exportTickets = () => {
        ticketsExport()
    }

    const importTickets = () => {
        setImporting(true)
    }

    const loadCSV = (e) => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
            const csv = e.target.result
            const lines = csv.split('\n')
            const result = []
            const headers = lines[0].split(',')
            for (let i = 1; i < lines.length; i++) {
                const obj = {}
                const currentline = lines[i].split(',')
                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j]
                }
                result.push(obj)
            }

            // Do this when headers are mapped
            setCsvData(result)
            setFoundHeaders(Object.keys(result[0]))
        }
        reader.readAsText(file)
    }

    const checkLoadedCSV = (csv) => {
        const csvHeaders = csv[0]
        let valid = true
        headers.forEach((header) => {
            if (!csvHeaders[header]) {
                valid = false
            }

            // check types correct

            // if (header === 'ID') {
            //     csv.forEach((row) => {
            //         if (row[header].length !== 24) {
            //             valid = false
            //         }
            //     })
            // }

            if (header === 'seats_count' || header === 'total_price') {
                csv.forEach((row) => {
                    if (isNaN(row[header])) {
                        valid = false
                    }
                })
            }

            if (header === 'created_date') {
                csv.forEach((row) => {
                    let isValid = moment(row[header], "DD/MM/YYYY", true).isValid()
                    if (!isValid) {
                        valid = false
                    }
                })
            }

            if (header === 'seats') {
                csv.forEach((row) => {
                    const seats = row[header].split(' | ')
                    seats.forEach((seat) => {
                        if (seat.length < 2) {
                            valid = false
                        }
                    })
                })
            }

            if (header === 'movie') {
                csv.forEach((row) => {
                    if (row[header].length < 1) {
                        valid = false
                    }
                })
            }

            if (header === 'Name' || header === 'Email') {
                csv.forEach((row) => {
                    if (row[header].length < 1) {
                        valid = false
                    }
                })
            }

            if (header === 'ticket_pdf') {
                csv.forEach((row) => {
                    if (row[header].length < 1) {
                        valid = false
                    }
                })
            }

            if (header === 'latitude' || header === 'longitude') {
                csv.forEach((row) => {
                    if (isNaN(row[header])) {
                        valid = false
                    }
                })
            }

        })

        if (valid) {
            // importTicketsToDB(csv)
        } else {
            alert('Invalid CSV')
        }
    }

    const mappingHeaders = (actualHeader, foundHeader) => {
        setMapHeaders((prev) => {
            return { ...prev, [actualHeader]: foundHeader }
        })   

        console.log(mapHeaders)
    }

    const showPreview = () => {
        debugger
        const mappedCSV = csvData.map((row) => {
            const mappedRow = {}
            Object.keys(row).forEach((key) => {
                let actualKey = Object.keys(mapHeaders).find(key => mapHeaders[key] === key)
                mappedRow[mapHeaders[key]] = row[key]
            })
            return mappedRow
        })
        console.log(mappedCSV)
    }

    return (
        <div className="text-gray-700 min-h-screen">
            <div className="flex justify-around flex-row flex-wrap w-full">
                <div className="overflow-scroll flex flex-row justify-center items-center w-full px-5">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-5" onClick={() => exportTickets()}>Export</button>

                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-5 ml-5" onClick={() => importTickets()}>Import</button>
                </div>

                {
                    importing && foundHeaders.length < 1 ?
                        <div className="p-4 bg-slate-400 rounded-md shadow-md">
                            <p className="font-bold text-white">Choose a csv file for import:</p>
                            <input type="file" accept=".csv" onChange={(e) => loadCSV(e)} />
                        </div> : <></>
                }

                {
                    importing && foundHeaders.length > 0 ?
                        <div className="p-4 bg-slate-400 rounded-md shadow-md">
                            <p className="font-bold text-white">Select the mappings for headers:</p>
                            <div>
                                <div className="container mx-auto columns-6 p-5">
                                    {

                                        foundHeaders.map((header) => {
                                            return (
                                                <div className="">
                                                    <p className="text-white">{header}</p>
                                                    <select className="bg-white rounded-md shadow-md" onChange={(e) => mappingHeaders(e.target.value, header)}>
                                                        {
                                                            headers.map((iHeader) => {
                                                                return (
                                                                    <option value={iHeader} key={iHeader} selected={header === iHeader} >{iHeader}</option>
                                                                )
                                                            }
                                                            )
                                                        }
                                                    </select>
                                                </div>
                                            )
                                        })
                                    }

                                </div>

                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-5 ml-5" onClick={() => showPreview()}>Preview</button>

                            </div>
                        </div>
                        : <></>
                }
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

export default connect(mapStateToProps, mapDispatchToProps)(TicketsImportAdmin)