import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faTrash, faPen, faImage } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import 'react-quill/dist/quill.snow.css';
import { fetchFunc } from "../utils"
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import {
    Tree,
    getBackendOptions,
    MultiBackend,
  } from "@minoru/react-dnd-treeview";
  import { DndProvider } from "react-dnd";

const fileTypes = ["JPG", "PNG", "GIF"];

// dynamic table component
const Table = ({ data, editCall, deleteCall, setShowImagePopupURL }) => {
    return (
        <>
            <table className="table table-striped relative z-0 text-white w-full">
                <thead className="">
                    <tr>
                        <th className="sticky top-0">Title</th>
                        <th className="sticky top-0">Director</th>
                        <th className="sticky top-0">Release Date</th>
                        <th className="sticky top-0">Category</th>
                        <th className="sticky top-0">Image</th>
                        <th className="sticky top-0">Actions</th>
                    </tr>
                </thead>
                <tbody className="">
                    {data?.length && data?.map(item => (
                        <tr key={item._id}>
                            <td className="truncate" title={item.title}>{item.title}</td>
                            <td className="truncate" title={item.director}>{item.director}</td>
                            <td className="truncate" title={item.release_date}>{item.release_date.split('T')[0]}</td>
                            <td className="truncate" title={item.category}>{item.category}</td>
                            <td className="truncate">
                                <a className="btn btn-sm btn-circle" title={item.image_url?.[0]} onClick={() => setShowImagePopupURL(`http://localhost:3001/${item.image_urls?.[0]}`)} target="_blank">
                                    <FontAwesomeIcon icon={faImage} className="text-blue-400" />
                                </a>
                            </td>
                            <td>
                                <button className="btn btn-circle ml-2" onClick={() => editCall(item._id)}>
                                    <FontAwesomeIcon icon={faPen} />
                                </button>
                                <button className="btn btn-circle ml-2 text-red-400" onClick={() => deleteCall(item._id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </td>
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

function NavigationAdmin(props) {
    const [navigationTitle, setNavigationTitle] = useState("")
    const [navigationURL, setNavigationURL] = useState("")
    const [navigationTarget, setNavigationTarget] = useState("_blank")
    const [isNavigationUpdating, setIsNavigationUpdating] = useState(false)

    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const [treeData, setTreeData] = useState([]);
    const handleDrop = (newTreeData, options) => {
        setTreeData(newTreeData);
        setIsNavigationUpdating(options.dragSourceId)
        setTimeout(() => {
            navigationUpdateMutate({
                id: options.dragSourceId,
                parentID: options.dropTargetId,
            })
        }, 1000)
    }

    useEffect(() => {
        if (!props.token) {
            const isAdmin = localStorage.getItem('isAdmin')
            if (!isAdmin) {
                navigate("/login")
            }
        }
    }, [])

    async function createFile(url) {
        let response = await fetch(`http://localhost:3001/${url}`);
        let data = await response.blob();
        let metadata = {
            type: 'image/jpeg'
        };
        let file = new File([data], url, metadata);

        return file
    }

    const { isLoading: navigationsLoading, isSuccess: navigationsSuccess, data: navigations } = useQuery('navigations', () =>
        fetchFunc('http://localhost:3001/admin/get-navigations', 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllNavigations'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data) => {
                setTreeData(data)
            }
        }
    )

    const { mutate: navigationMutate, isSuccess: navigationIsSuccess, isLoading: navigationIsLoading, isError: navigationIsError } = useMutation('add-navigation', (data) =>
        fetchFunc('http://localhost:3001/admin/add-navigation', 'POST', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, JSON.stringify(data), navigate, 'addNavigation')
        , {
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries('navigations')
                setIsNavigationUpdating(false)
                setNavigationTitle("")
                setNavigationURL("")
                setNavigationTarget("_blank")
            }
        }
    )

    const deleteCall = (id) => {
        navigationMutateDelete.mutate({
            id
        })
    }

    const editCall = (id) => {
        const navigation = navigations.find(item => item.id === id)
        setNavigationTitle(navigation.data.Title)
        setNavigationURL(navigation.data.URL)
        setNavigationTarget(navigation.data._target)
        setIsNavigationUpdating(id)
    }


    const navigationMutateDelete = useMutation('delete-navigation', (data) =>
        fetchFunc(`http://localhost:3001/admin/delete-navigation/${data.id}`, 'DELETE', {
            'x-access-token': localStorage.getItem('token'),
            'accept': 'application/json',
            'content-type': 'application/json'
        }, null, navigate, 'deleteNavigation'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('navigations')
        }
    }
    )

    const { mutate: navigationUpdateMutate } = useMutation('update-navigation', (data) =>
        fetchFunc(`http://localhost:3001/admin/update-navigation/${isNavigationUpdating}`, 'PUT', {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, JSON.stringify(data), navigate, 'updateNavigate'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('navigations')
        }
    }
    )

    const saveNewNavigation = () => {
        const data = {
            Title: navigationTitle,
            URL: navigationURL,
            _target: navigationTarget
        }
        if (isNavigationUpdating) {
            navigationUpdateMutate(data)
        } else {
            navigationMutate(data)
        }
    }

    return (
        <div className="text-gray-100 min-h-screen">
            <div className="flex ml-5">
                <div className="mt-5 mr-5">
                    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                        <input type="checkbox" /> 
                        <div className="collapse-title text-xl font-medium">
                            Links
                        </div>
                        <div className="collapse-content"> 
                            <div className="columns-1">
                                <div className="form-control mt-2 w-full mr-2">
                                    <label className="label">
                                        <span className="label-text text-white">Title</span>
                                    </label>
                                    <input type="text" placeholder="Type here" value={navigationTitle} onChange={(e) => setNavigationTitle(e.target.value)} className="input text-white" />
                                </div>
                                <div className="form-control mt-2 w-full mr-2">
                                    <label className="label">
                                        <span className="label-text text-white">URL</span>
                                    </label>
                                    <input type="text" placeholder="Type here" value={navigationURL} onChange={(e) => setNavigationURL(e.target.value)} className="input text-white" />
                                </div>
                                <div className="form-control mt-2 w-full mr-2">
                                    <label className="label">
                                        <span className="label-text text-white">Target</span>
                                    </label>
                                    <select className="select select-bordered w-full text-white" value={navigationTarget} onChange={(e) => setNavigationTarget(e.target.value)}>
                                        <option value="_blank">_blank</option>
                                        <option value="_self">_self</option>
                                        <option value="_parent">_parent</option>
                                        <option value="_top">_top</option>
                                    </select>
                                </div>
                            </div>
                            <button className="btn btn-success my-2 btn-sm float-right" onClick={() => saveNewNavigation()}>{navigationIsLoading ? 'Saving...' : isNavigationUpdating ? 'Update Navigation' : 'Save Navigation'}</button>
                        </div>
                    </div>
                </div>
                <div className="mt-5 w-1/2 text-gray-100">
                    <div className="border border-base-300 bg-base-100 rounded-box p-4">
                        <h1 className="text-xl font-medium">Menu Structures</h1>

                        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                            <Tree
                                tree={treeData}
                                rootId={"0"}
                                onDrop={handleDrop}
                                sort={false}
                                render={(node, { depth, isOpen, onToggle }) => (
                                    <div style={{ marginLeft: depth * 10 }} className="flex w-2/2 bg-gray-300 text-black font-medium p-2 rounded-sm mt-2">
                                        {node.droppable && (
                                            <span onClick={onToggle} className="mr-2">{isOpen ? "[-]" : "[+]"}</span>
                                        )}
                                        {node.text}

                                        <span className="ml-auto">
                                            <button className="btn btn-primary btn-sm mr-1" onClick={() => editCall(node.id)}>Edit</button>
                                            <button className="btn btn-error btn-sm" onClick={() => deleteCall(node.id)}>Delete</button>
                                        </span>
                                    </div>
                                )}
                            />
                        </DndProvider>
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

export default connect(mapStateToProps, mapDispatchToProps)(NavigationAdmin)