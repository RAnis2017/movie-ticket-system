import React, { useEffect } from "react"
import { connect } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { fetchFunc } from "../utils"
import NavigationMenu from "./NavigationMenu"

function PageContent(props) {
    const params = useParams()

    useEffect(() => {
        console.log(params)
    }, [])

    const { isLoading: pageLoading, isSuccess: pageSuccess, data: page } = useQuery('pages', () =>
        fetchFunc(`http://localhost:3001/get-page?id=${params['*']}`, 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllPages'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data) => {
            }
        }
    )

    const navigate = useNavigate()

    return (
        <div>
            <NavigationMenu />

            <div className="flex justify-center items-center">
                <div className="w-2/3 mt-10">
                    <div className="flex justify-start bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div className="">
                            <h1 className="text-4xl font-bold text-slate-500 mb-2">{page?.Title}</h1>
                            <div className="flex">
                                <img src={`http://localhost:3001/${page?.Image}`} alt="Page Featured Image" className="max-w-md" />
                                <div className="mb-4 mx-4 text-gray-500">
                                    {
                                        page?.Description?.length ?
                                            <div className="mt-4" dangerouslySetInnerHTML={{ __html: page?.Description }} />
                                            : ''
                                    }
                                </div>
                            </div>
                        </div>
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PageContent)