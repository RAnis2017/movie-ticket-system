import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import 'react-quill/dist/quill.snow.css';
import { fetchFunc } from "../utils"
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import {
    Tree,
    getBackendOptions,
    MultiBackend,
  } from "@minoru/react-dnd-treeview";
  import { DndProvider } from "react-dnd";
import Multiselect from 'multiselect-react-dropdown';

const fileTypes = ["JPG", "PNG", "GIF"];

function NavigationAdmin(props) {
    const [navigationTitle, setNavigationTitle] = useState("")
    const [navigationURL, setNavigationURL] = useState("")
    const [navigationTarget, setNavigationTarget] = useState("_blank")
    const [isNavigationUpdating, setIsNavigationUpdating] = useState(false)
    const [multiSelectData, setMultiSelectData] = useState([])
    const multiselectRef = useRef(null)

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

    const { isLoading: navigationsLoading, isSuccess: navigationsSuccess, data: navigations } = useQuery('navigations', () =>
        fetchFunc('http://localhost:3001/get-navigations', 'GET', {
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

    const { isLoading: pagesLoading, isSuccess: pagesSuccess, data: pages } = useQuery('pages', () =>
        fetchFunc('http://localhost:3001/get-pages', 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllPages'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data) => {
                const multiSelectData = data.map(page => {
                    return {
                        id: page._id,
                        name: page.Title,
                        slug: page.Slug,
                    }
                })
                setMultiSelectData(multiSelectData)
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
                multiselectRef.current.resetSelectedValues()
            }
        }
    )


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
            setIsNavigationUpdating(false)
            setNavigationTitle("")
            setNavigationURL("")
            setNavigationTarget("_blank")

            const ordered = treeData.map((item, index) => {
                return {
                    _id: item.id,
                    droppable: item.droppable,
                    parentID: item.parent,
                    _target: item.data._target,
                    URL: item.data.URL,
                    Title: item.data.Title,
                    order: index
                }
            })
            navigationOrderUpdateMutate(ordered)

        }
    }
    )

    const { mutate: navigationOrderUpdateMutate } = useMutation('update-order-navigation', (data) =>
        fetchFunc(`http://localhost:3001/admin/update-navigation-order`, 'PUT', {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, JSON.stringify(data), navigate, 'updateNavigateOrder'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('navigations')
        }
    }
    )

    const deleteCall = (id, page = false) => {
        navigationMutateDelete.mutate({ id: id })
    }

    const editCall = (id) => {
        const navigationData = navigations.find(item => item.id === id)
        setNavigationTitle(navigationData.data.Title)
        setNavigationURL(navigationData.data.URL)
        setNavigationTarget(navigationData.data._target)
        setIsNavigationUpdating(id)
    }

    const saveNewNavigation = () => {
        const data = {
            Title: navigationTitle,
            URL: navigationURL,
            _target: navigationTarget,
            order: navigations.length,
        }
        if (isNavigationUpdating) {
            navigationUpdateMutate(data)
        } else {
            navigationMutate(data)
        }
    }

    const addNewPages = () => {
        const data = []
        let order = navigations.length
        multiselectRef.current.getSelectedItems().forEach(item => {
            data.push({
                Title: item.name,
                URL: item.slug,
                _target: "internal",
                order: order,
            })
            order++
        })
        navigationMutate(data)
    }

    return (
        <div className="text-gray-100 min-h-screen">
            <div className="flex ml-5">
                <div className="mt-5 mr-5">
                    <div className="collapse collapse-arrow border border-base-300 bg-base-300 rounded-box">
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

                    <div className="collapse collapse-arrow border border-base-300 bg-base-300 rounded-box">
                        <input type="checkbox" /> 
                        <div className="collapse-title text-xl font-medium">
                            Pages
                        </div>
                        <div className="collapse-content"> 
                            <div className="columns-1 text-black">
                                <Multiselect
                                options={multiSelectData}
                                displayValue="name"
                                showCheckbox={true}
                                className="text-black"
                                ref={multiselectRef}
                                style={{ multiselectContainer: { width: '15.5em' } }}
                                />
                            </div>
                            <button className="btn btn-success my-2 btn-sm float-right" onClick={() => addNewPages()}>{false ? 'Saving...' : 'Add Pages'}</button>
                        </div>
                    </div>
                </div>
                <div className="mt-5 w-1/2 text-gray-100">
                    <div className="border border-base-300 bg-base-100 rounded-box p-4 py-10 ">
                        <h1 className="text-xl font-medium">Menu Structures</h1>

                        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                            <Tree
                                tree={treeData}
                                rootId={"0"}
                                onDrop={handleDrop}
                                sort={false}
                                classes={{
                                    container: 'py-2',
                                }}
                                render={(node, { depth, isOpen, onToggle }) => (
                                    <div style={{ marginLeft: depth * 10 }} className="flex w-2/2 bg-gray-300 text-black font-medium p-2 rounded-sm mt-2">
                                        {node.droppable && (
                                            <span onClick={onToggle} className="mr-2">{isOpen ? "[-]" : "[+]"}</span>
                                        )}
                                        {node.text}

                                        <span className="ml-auto">
                                            <span className="mr-1 font-light text-gray-500">{node.data?._target !== 'internal' ? 'Custom Link' : 'Page'}</span>
                                            {
                                                node.data?._target !== 'internal' && (
                                                    <button className="btn btn-primary btn-sm mr-1" onClick={() => editCall(node.id, node.data?._target ? false : true)}>Edit</button>
                                                )
                                            }
                                            <button className="btn btn-error btn-sm" onClick={() => deleteCall(node.id, node.data?._target ? false : true)}>Delete</button>
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