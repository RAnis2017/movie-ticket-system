import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faChair } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"
const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function SettingsAdmin(props) {
    const [seatsPerRow, setSeatsPerRow] = useState(0)
    const [rows, setRows] = useState(0)
    const [divideSeatsBy, setDivideSeatsBy] = useState(1)
    const [settingId, setSettingId] = useState(0)

    const queryClient = useQueryClient()

    useEffect(() => {

    }, [seatsPerRow, rows, divideSeatsBy])

    const alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

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

    const getRows = () => {
        const returnRows = []
        for (let i = 0; i < rows; i++) {
            returnRows.push(
                <div key={`row-${i}`} className="flex items-center mt-5">
                    <div className=" mr-5 text-violet-700 font-black">
                        <h1>{alphabets[i]}</h1>
                    </div>
                    { seatsPerRow > 0 && getCols() }
                </div>
            )
        }

        return returnRows
    }

    const getCols = () => {
        const cols = []
        const afterDivide = seatsPerRow / (divideSeatsBy > 0 ? divideSeatsBy : 1)
        for (let i = 1; i <= seatsPerRow; i++) {
            cols.push(
                <div key={`col-${i}`} className="flex flex-col mr-2 p-1 btn btn-circle text-violet-700 bg-slate-100">
                    <FontAwesomeIcon icon={faChair} />
                    <span className="text-center">{i}</span>
                </div>
            )
            if (i % Math.ceil(afterDivide) === 0) {
                cols.push(<div key={`divider-${i}`} className="mr-10"></div>)
            }
        }

        return cols
    }

    return (
        <div>
            <div className="flex justify-center mb-10 mt-5">
                <div className="w-6/12 bg-slate-700 rounded-lg p-5 shadow-lg">
                    <div className="flex flex-row">
                        <div className="form-control ">
                            <label className="label">
                                <span className="label-text text-white">Seats Per Row</span>
                            </label>
                            <input type="number" placeholder="Type here" min={0} value={seatsPerRow} onChange={(e) => setSeatsPerRow(e.target.value)} className="input input-ghost " />
                        </div>
                        <div className="form-control ">
                            <label className="label">
                                <span className="label-text text-white">Rows</span>
                            </label>
                            <input type="number" placeholder="Type here" min={0} max={26} value={rows} onChange={(e) => setRows(e.target.value)} className="input input-ghost " />
                        </div>
                        <div className="form-control ">
                            <label className="label">
                                <span className="label-text text-white">Divide Seats By</span>
                            </label>
                            <input type="number" placeholder="Type here" min={0} value={divideSeatsBy} onChange={(e) => setDivideSeatsBy(e.target.value)} className="input input-ghost " />
                        </div>
                    </div>
                    <div className="flex justify-end mt-5">
                    <button className="btn btn-success" onClick={() => saveNewSetting()}>{isLoading ? 'Saving...' : 'Save Settings'}</button>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col overflow-x-auto max-w-6xl">
                {
                    rows > 0 && getRows(rows)
                }
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