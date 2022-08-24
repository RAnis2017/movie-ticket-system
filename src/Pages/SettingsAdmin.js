import React, { useState } from "react"
import { connect } from "react-redux"
import { useGoogleLogout } from 'react-google-login'
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"
const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function SettingsAdmin(props) {
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

    const { mutate: settingUpdateMutate, isLoading } = useMutation('update-setting', (data) =>
        fetchFunc(`http://localhost:3001/admin/update-setting/${settingId}`, 'PUT', {
            'x-access-token': localStorage.getItem('token'),
            'accept': 'application/json',
            'content-type': 'application/json'
        }, JSON.stringify(data), navigate, 'updateSetting'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('settings')
        }
    }
    )

    const navigate = useNavigate()

    const saveNewSetting = () => {
        settingUpdateMutate({ seats_per_row: seatsPerRow, rows, divide_seats_by: divideSeatsBy })
    }

    return (
        <div>
            <div className="flex justify-end">
                <div className=" w-1/3 mt-10">
                    <button className="btn btn-success ml-3" onClick={() => saveNewSetting()}>{isLoading ? 'Saving...' : 'Save Category'}</button>
                </div>
            </div>

            <div className="flex justify-center mt-5 mb-10">
                <div className="w-6/12 bg-slate-700 rounded-lg p-5 shadow-lg flex justify-center flex-row">
                    <div className="w-full max-w-md">
                        <div className="form-control w-full max-w-md">
                            <label className="label">
                                <span className="label-text text-white">Seats Per Row</span>
                            </label>
                            <input type="number" placeholder="Type here" value={seatsPerRow} onChange={(e) => setSeatsPerRow(e.target.value)} className="input input-ghost w-full max-w-md" />
                        </div>
                        <div className="form-control w-full max-w-md">
                            <label className="label">
                                <span className="label-text text-white">Rows</span>
                            </label>
                            <input type="number" placeholder="Type here" value={rows} onChange={(e) => setRows(e.target.value)} className="input input-ghost w-full max-w-md" />
                        </div>
                        <div className="form-control w-full max-w-md">
                            <label className="label">
                                <span className="label-text text-white">Divide Seats By</span>
                            </label>
                            <input type="number" placeholder="Type here" value={divideSeatsBy} onChange={(e) => setDivideSeatsBy(e.target.value)} className="input input-ghost w-full max-w-md" />
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingsAdmin)