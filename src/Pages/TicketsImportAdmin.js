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
    const [isPreviewVisible, setIsPreviewVisible] = useState(false)
    const [errorsObject, setErrorsObject] = useState({})

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
                    csv.push([ticket._id, ticket.Name, ticket.Email, ticket.seats_count, ticket.movie.slug, seats, ticket.total_price, new Date(ticket.created_date).toLocaleDateString(), ticket.latitude, ticket.longitude, ticket.ticket_pdf])
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

    const { mutate: ticketsImport } = useMutation('ticketsImport', (data) =>
        fetchFunc('http://localhost:3001/admin/import-tickets', 'POST', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, JSON.stringify(data), navigate, 'importTickets'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data) => {
                setImporting(false)
                setIsPreviewVisible(false)
                setCsvData([])
                setFoundHeaders([])
                setMapHeaders({
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
                setErrorsObject({})

                if(data?.errors?.length) {
                    setErrorsObject(data.errors.reduce((acc, curr) => {
                        acc[curr.row] = curr.error
                        return acc
                    }, {}))
                }
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
            Object.keys(result[0]).forEach((key) => {
                let found = Object.keys(mapHeaders).findIndex((mapKey) => mapKey === key) > -1
                if(found) {
                    setMapHeaders((prev) => ({ ...prev, [key]: key }))
                }
            })

            setFoundHeaders(Object.keys(result[0]))
        }
        reader.readAsText(file)
    }

    const checkLoadedCSV = (csv) => {
        const csvHeaders = csv[0]
        let valid = true
        const errorsObject = {}
        headers.forEach((header) => {
            if(header !== 'longitude' && header !== 'latitude' && header !== 'ticket_pdf') {
                if (!csvHeaders[header]) {
                    valid = false
                    errorsObject[header] = 'Required'
                }
            }

            if (header === 'seats_count' || header === 'total_price') {
                csv.forEach((row) => {
                    if (isNaN(row[header])) {
                        valid = false
                        errorsObject[header] = 'Must be a number'
                    }
                })
            }

            if (header === 'created_date') {
                csv.forEach((row) => {
                    let isValid = moment(row[header], "DD/MM/YYYY", true).isValid()
                    if (!isValid) {
                        valid = false
                        errorsObject[header] = 'Must be a date'
                    }
                })
            }

            if (header === 'seats') {
                csv.forEach((row) => {
                    const seats = row[header].split(' | ')
                    seats.forEach((seat) => {
                        if (seat.length < 2) {
                            valid = false
                            errorsObject[header] = 'Must be valid form of seats (A1 | B2 | C3)'
                        }
                    })
                })
            }

            if (header === 'movie') {
                csv.forEach((row) => {
                    if (row[header].length < 1) {
                        valid = false
                        errorsObject[header] = 'Invalid movie. Must be a string'
                    }
                })
            }

            if (header === 'Name' || header === 'Email') {
                csv.forEach((row) => {
                    if (row[header].length < 1) {
                        valid = false
                        errorsObject[header] = 'Invalid name or email. Must be a string and not empty'
                    }
                })
            }

            // Ticket PDF is not required
            // if (header === 'ticket_pdf') {
            //     csv.forEach((row) => {
            //         if (row[header].length < 1) {
            //             valid = false
            //         }
            //     })
            // }

            // Longitude and latitude are not required
            // if (header === 'latitude' || header === 'longitude') {
            //     csv.forEach((row) => {
            //         if (isNaN(row[header])) {
            //             valid = false
            //         }
            //     })
            // }

        })

        if (valid) {
            setIsPreviewVisible(true)
        } else {
            setErrorsObject({
                ...errorsObject,
                csv: 'CSV file is not valid'
            })
            setIsPreviewVisible(true)
        }
    }

    const mappingHeaders = (actualHeader, foundHeader) => {
        let newMapHeaders = mapHeaders
        newMapHeaders[actualHeader] = foundHeader
        setMapHeaders(newMapHeaders)   

        console.log(mapHeaders)
    }

    const showPreview = () => {
        const mappedCSV = csvData.map((row) => {
            const mappedRow = {}
            Object.keys(row).forEach((key) => {
                let actualKey = Object.keys(mapHeaders).find(iKey => mapHeaders[iKey] === key)
                mappedRow[actualKey] = row[key]
            })
            return mappedRow
        })

        setCsvData(mappedCSV)
        checkLoadedCSV(mappedCSV)
    }

    const importCSV = () => {
        debugger
        ticketsImport({
            csvData,
            mapHeaders
        })
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
                    importing && foundHeaders.length > 0 && isPreviewVisible === false ?
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
                {
                    importing && foundHeaders.length > 0 && isPreviewVisible ?
                        <div className="p-4 bg-slate-700 rounded-md shadow-md w-5/6 h-1/6">
                            <div className={` alert alert-error mt-2 flex flex-col items-start shadow-lg ${errorsObject.csv ?  '' : 'hidden'}`}>
                                {
                                    Object.keys(errorsObject).map((key) => {
                                        return (
                                            <div>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <p className="text-white">{errorsObject[key]}</p>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <p className="font-bold text-white">Preview:</p>
                            <div className="overflow-scroll text-white">
                                <table className="table-auto">
                                    <thead>
                                        <tr>
                                            {
                                                headers.map((header) => {
                                                    return (
                                                        <th className="px-4 py-2">{header}</th>
                                                    )
                                                }
                                                )
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            csvData.map((row, index) => {
                                                if (index < 5) {
                                                    return (
                                                        <tr>
                                                            {
                                                                headers.map((header) => {
                                                                    return (
                                                                        <td className="border px-4 py-2">{row[header]}</td>
                                                                    )
                                                                }
                                                                )
                                                            }
                                                        </tr>
                                                    )
                                                }
                                            }
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-5 ml-5" onClick={() => importCSV()}>Import</button>
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