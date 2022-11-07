import React, { useEffect } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import { fetchFunc } from "../utils"

function Footer(props) {

    const navigate = useNavigate()
    useEffect(() => {

    }, [])

    const { isLoading: blocksLoading, isSuccess: blocksSuccess, data: blocks } = useQuery('blocks', () =>
        fetchFunc('http://localhost:3001/get-blocks', 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllBlocks'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false
        }
    )

    return (
        <div>
            <footer className="w-full bg-slate-600 relative bottom-0 py-5 px-2">
                <div className="grid grid-cols-4 justify-items-center">
                    {
                        blocksSuccess && blocks.map((block, index) => {
                            return (
                                <div key={index} className="text-white">
                                    {/* <h1 className="text-xl font-bold mb-2">{block.data.Name}</h1> */}
                                    <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: block.data.Content }} />
                                </div>
                            )
                        }
                        )
                    }
                    
                </div>
            </footer>
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

export default connect(mapStateToProps, mapDispatchToProps)(Footer)