import React, { useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"
const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function MoviesSeatSelect(props) {
    const [seatsPerRow, setSeatsPerRow] = useState(0)
    const [rows, setRows] = useState(0)
    const [divideSeatsBy, setDivideSeatsBy] = useState(1)
    const [settingId, setSettingId] = useState(0)

    const queryClient = useQueryClient()

    const { isLoading: settingsLoading, isSuccess: settingsSuccess, data: settings } = useQuery('settings', () =>
        fetchFunc(`http://localhost:3001/admin/get-settings/${'movie_settings_1'}`, 'GET', {
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

    return (
        <div>
            
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