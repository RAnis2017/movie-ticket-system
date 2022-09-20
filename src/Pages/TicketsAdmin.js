import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faTrash, faPen, faImage } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchFunc } from "../utils"
import { FileUploader } from "react-drag-drop-files";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app

const fileTypes = ["JPG", "PNG", "GIF"];


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

function TicketsAdmin(props) {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    useEffect(() => {
        if (!props.token) {
            const isAdmin = localStorage.getItem('isAdmin')
            if (!isAdmin) {
                navigate("/login")
            }
        }
    }, [])

    const { isLoading: ticketsLoading, isSuccess: ticketsSuccess, data: tickets } = useQuery('tickets', () =>
        fetchFunc('http://localhost:3001/admin/get-tickets', 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllTickets'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data) => {
                console.log(data)
            }
        }
    )

    return (
        <div className="text-gray-700 min-h-screen">
            <div className="flex justify-around flex-row flex-wrap w-full">
                <div className="overflow-scroll flex flex-col justify-center items-center w-full px-5">
                    <Table data={tickets?.tickets} />
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

export default connect(mapStateToProps, mapDispatchToProps)(TicketsAdmin)