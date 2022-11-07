import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchFunc } from "../utils"
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import {
    Tree,
    getBackendOptions,
    MultiBackend,
  } from "@minoru/react-dnd-treeview";
import { DndProvider } from "react-dnd";

function BlocksAdmin(props) {
    const [block1Content, setBlock1Content] = useState("")
    const [block2Content, setBlock2Content] = useState("")
    const [block3Content, setBlock3Content] = useState("")
    const [block4Content, setBlock4Content] = useState("")
    const [currentSelected, setCurrentSelected] = useState(null)

    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const [treeData, setTreeData] = useState([{
        id: 1,
        text: "Footer 1",
        droppable: false,
        parent: '0',
        data: {
            order: 1,
            content: ""
        }
    }, {
        id: 2,
        text: "Footer 2",
        droppable: false,
        parent: '0',
        data: {
            order: 2,
            content: ""
        }
    }, {
        id: 3,
        text: "Footer 3",
        droppable: false,
        parent: '0',
        data: {
            order: 3,
            content: ""
        }
    }, {
        id: 4,
        text: "Footer 4",
        droppable: false,
        parent: '0',
        data: {
            order: 4,
            content: ""
        }
    }]);
    const handleDrop = (newTreeData, options) => {
        setTreeData(() => {
            const ordered = newTreeData.map((item, index) => {
                return {
                    _id: item.id,
                    droppable: false,
                    parentID: '0',
                    Content: item.data.Content,
                    order: index
                }
            })
            blocksOrderUpdateMutate(ordered)
            return newTreeData
        });
        
    }

    useEffect(() => {
        if (!props.token) {
            const isAdmin = localStorage.getItem('isAdmin')
            if (!isAdmin) {
                navigate("/login")
            }
        }
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
            refetchOnError: false,
            onSuccess: (data) => {
                setTreeData(data)
            }
        }
    )

    const { mutate: blocksUpdateMutate } = useMutation('update-blocks', (data) =>
        fetchFunc(`http://localhost:3001/admin/update-blocks/${currentSelected}`, 'PUT', {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, JSON.stringify(data), navigate, 'updateBlocks'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('blocks')
        }
    }
    )

    const { mutate: blocksOrderUpdateMutate } = useMutation('update-order-blocks', (data) =>
        fetchFunc(`http://localhost:3001/admin/update-blocks-order`, 'PUT', {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, JSON.stringify(data), navigate, 'updateBlockOrder'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('blocks')
        }
    }
    )

    const saveNewBlocks = () => {
        const newBlock = treeData.find(item => item.id === currentSelected)
        blocksUpdateMutate(newBlock.data)
    }

    const setContentForNode = (id, content) => {
        const newData = treeData.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    data: {
                        ...item.data,
                        Content: content
                    }
                }
            }
            return item
        })
        setTreeData(newData)
    }

    const getBlocksValue = (id) => {
        const block = treeData.find((item) => item.id === id)
        return block.data.Content || ""
    }

    return (
        <div className="text-gray-100 min-h-screen">
            <div className="flex ml-5">
                <div className="mt-5 w-full flex justify-center text-gray-100">
                    <div className="w-full border border-base-300 bg-base-100 rounded-box p-4 py-10 ">
                        <h1 className="text-xl font-black text-center underline">Footer Blocks</h1>

                        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                            <Tree
                                tree={treeData}
                                rootId={"0"}
                                onDrop={handleDrop}
                                sort={false}
                                classes={{
                                    container: 'py-2 px-2 mr-2 ml-2',
                                    dropTarget: 'bg-base-200',
                                }}
                                render={(node, { depth, isOpen, onToggle }) => (
                                    <div style={{ marginLeft: depth * 10 }} className=" bg-gray-300 text-black font-medium p-2 rounded-sm mt-2" onClick={() => { setCurrentSelected(node.id) }}>
                                        <p className="font-bold text-center">{node.text}</p>

                                        {
                                            currentSelected === node.id && (
                                                <>
                                                    <ReactQuill className="bg-slate-800 text-white border-transparent" theme="snow" value={getBlocksValue(node.id)} onChange={(e) => {setContentForNode(node.id, e)}} />
                                                    <p className="flex justify-end">
                                                        <button className="btn btn-primary btn-md my-2" onClick={() => saveNewBlocks()}>Save</button>
                                                    </p>
                                                </>
                                            )
                                        }
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

export default connect(mapStateToProps, mapDispatchToProps)(BlocksAdmin)