import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faTrash, faPen, faImage } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import 'react-quill/dist/quill.snow.css';
import { fetchFunc } from "../utils"
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import { FileUploader } from "react-drag-drop-files"
import Lightbox from 'react-image-lightbox';
import ReactQuill from "react-quill"

const fileTypes = ["JPG", "PNG", "GIF"];

// dynamic table component
const Table = ({ data, editCall, deleteCall, setShowImagePopupURL }) => {
    return (
        <>
            <table className="table table-striped relative z-0 text-white w-full">
                <thead className="">
                    <tr>
                        <th className="sticky top-0">Title</th>
                        <th className="sticky top-0">Slug</th>
                        <th className="sticky top-0">Parent</th>
                        <th className="sticky top-0">Image</th>
                        <th className="sticky top-0">Actions</th>
                    </tr>
                </thead>
                <tbody className="">
                    {data?.length && data?.map(item => (
                        <tr key={item._id}>
                            <td className="truncate" title={item.title}>{item.Title}</td>
                            <td className="truncate" title={item.slug}>{item.Slug}</td>
                            <td className="truncate" title={item.parentID}>{data.find(i => i._id === item.parentID)?.Title ? data.find(i => i._id === item.parentID)?.Title : 'No Parent'}</td>
                            <td className="truncate">
                                <a className="btn btn-sm btn-circle" title={item.Image} onClick={() => setShowImagePopupURL(`http://localhost:3001/${item.Image}`)} target="_blank">
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

function PageAdmin(props) {
    const [pageTitle, setPageTitle] = useState("")
    const [pageSlug, setPageSlug] = useState("")
    const [pageDescription, setPageDescription] = useState("")
    const [pageImage, setPageImage] = useState("")
    const [pageParent, setPageParent] = useState("")
    const [isPageUpdating, setIsPageUpdating] = useState(false)
    const [uploadImage, setUploadImage] = useState("")
    const [slugExists, setSlugExists] = useState(false)
    const [pageParentSlug, setPageParentSlug] = useState("")
    const [addPageClicked, setAddPageClicked] = useState(false)
    const [showImagePopupURL, setShowImagePopupURL] = useState('')

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

    const { isLoading: pagesLoading, isSuccess: pagesSuccess, data: pages } = useQuery('pages', () =>
        fetchFunc('http://localhost:3001/get-pages', 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllPage'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data) => {
            }
        }
    )

    const { mutate: pageMutate, isSuccess: pageIsSuccess, isLoading: pageIsLoading, isError: pageIsError } = useMutation('add-page', (data) =>
        fetchFunc('http://localhost:3001/admin/add-page', 'POST', {
            'x-access-token': localStorage.getItem('token'),
        }, data, navigate, 'addPage')
        , {
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries('pages')
                setIsPageUpdating(false)
                setPageTitle("")
                setPageSlug("")
                setPageDescription("")
                setPageImage("")
                setPageParent("")
                setUploadImage("")
                setAddPageClicked(false)
            }
        }
    )


    const pageMutateDelete = useMutation('delete-page', (data) =>
        fetchFunc(`http://localhost:3001/admin/delete-page/${data.id}`, 'DELETE', {
            'x-access-token': localStorage.getItem('token'),
            'accept': 'application/json',
            'content-type': 'application/json'
        }, null, navigate, 'deletePage'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('pages')
        }
    }
    )

    const { mutate: pageUpdateMutate } = useMutation('update-page', (data) =>
        fetchFunc(`http://localhost:3001/admin/update-page/${isPageUpdating}`, 'PUT', {
            'x-access-token': localStorage.getItem('token'),
        }, data, navigate, 'updatePage'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('pages')
            setIsPageUpdating(false)
            setPageTitle("")
            setPageSlug("")
            setPageDescription("")
            setPageImage("")
            setPageParent("")
            setUploadImage("")
            setAddPageClicked(false)
        }
    }
    )

    const deleteCall = (id) => {
        pageMutateDelete.mutate({ id: id })
    }

    const editCall = (id) => {
        const pageData = pages.find(item => item._id === id)
        setPageTitle(pageData.Title)
        setPageSlug(pageData.Slug[0] === '/' ? pageData.Slug.slice(1) : pageData.Slug)
        setPageDescription(pageData.Description)
        setPageImage(pageData.Image)
        setPageParent(pageData.parentID)
        setIsPageUpdating(id)
        setAddPageClicked(true)
    }

    const addNewPage = () => {
        setAddPageClicked((prev) => !prev)
    }

    const saveNewPage = () => {
        const form = new FormData()
        let pageSlugNew = pageSlug[0] === '/' ? pageSlug : `/${pageSlug}`
        if (pageImage?.size > 0) {
            form.append('image', pageImage)
        }
        form.append('Title', pageTitle)
        form.append('Slug', pageParentSlug ? pageParentSlug + pageSlugNew  :  pageSlugNew)
        form.append('Description', pageDescription)
        form.append('Parent', pageParent)

        if (isPageUpdating) {
            pageUpdateMutate(form)
        } else {
            pageMutate(form)
        }
    }

    const addImageToPage = (file) => {
        setPageImage(file)
        let image = {
            name: file.name,
            size: file.size,
            image: URL.createObjectURL(file)
        }

        setUploadImage(image)
    }

    const setPageTitleAndSlug = (e) => {
        setPageTitle(e.target.value)
        const slug = e.target.value.toLowerCase().replace(/ /g, "-")
        // check if slug already exists
        if(slug[0] === "/") {
            slug = slug.slice(1)
        }
        let pagesExceptCurrent = pages.filter(item => item._id !== isPageUpdating)
        const slugExists = pagesExceptCurrent.find(item => item.Slug[0] === '/' ? item.Slug.slice(1) === slug : item.Slug === slug)

        setPageSlug(slug)
        if (!slugExists) {
            setSlugExists(false)
        } else {
            setSlugExists(true)
        }
    }

    const setPageSlugAndCheck = (e) => {
        const slug = e.target.value.toLowerCase().replace(/ /g, "-")
        
        if(slug[0] === "/") {
            slug = slug.slice(1)
        }
        setPageSlug(slug)
        const slugExists = pages.find(item => item.Slug[0] === '/' ? item.Slug.slice(1) === slug : item.Slug === slug)

        if (!slugExists) {
            setSlugExists(false)
        } else {
            setSlugExists(true)
        }
    }

    const setPageParentAndSlug = (e) => {
        if (e.target.value === "0") {
            setPageParent("")
            setPageParentSlug("")
        } else {
            setPageParent(e.target.value)
            const getParent = pages.find(item => item._id === e.target.value)
            setPageParentSlug(getParent.Slug)
        }
    }

    return (
        <div className="text-gray-700 min-h-screen">
            <div className="flex justify-end">
                <div className="mt-5 mr-5">
                    {
                        addPageClicked ?
                            <button className="btn btn-success mb-2" onClick={() => saveNewPage()}>{pageIsLoading ? 'Saving...' : isPageUpdating ? 'Update Movie' : 'Save Movie'}</button>
                            :
                            <button className="btn btn-primary mb-2" onClick={() => addNewPage()}>Add Page</button>
                    }
                </div>
            </div>
            {
                addPageClicked ?
                    <div className="flex flex-wrap mt-5 px-5">
                        <div className="w-full bg-slate-700 rounded-lg p-5 shadow-lg flex flex-wrap flex-row">
                            <div className="w-full">
                                <div className="flex justify-between flex-col">
                                    <div className="form-control mt-2 w-full mr-2">
                                        <label className="label">
                                            <span className="label-text text-white">Title</span>
                                        </label>
                                        <input type="text" placeholder="Type here" value={pageTitle} onChange={(e) => setPageTitleAndSlug(e)} className="input text-white" />
                                    </div>
                                    <div className="form-control mt-2 w-full mr-2">
                                        <label className="label">
                                            <span className="label-text text-white">Slug</span>
                                        </label>

                                        <span className="text-white ml-2">
                                            {
                                                pageParentSlug?.length > 0 ? (
                                                    pageParentSlug + '/'
                                                ) : (
                                                    '/'
                                                )
                                            }
                                            <input type="text" disabled="true" placeholder="Type here" value={pageSlug} className="input text-white disabled:text-white inline-block ml-2" />
                                        </span>
                                        {slugExists && <span className="text-red-500">Slug already exists</span>}
                                    </div>
                                    <div className="form-control mt-2 w-full mr-2">
                                        <label className="label">
                                            <span className="label-text text-white">Description</span>
                                        </label>
                                        <ReactQuill className="bg-slate-800 text-white border-transparent" theme="snow" value={pageDescription} onChange={(e) => { setPageDescription(e) }} />
                                    </div>
                                    <div className="form-control mt-2 w-full mr-2">
                                        <label className="label">
                                            <span className="label-text text-white">Parent</span>
                                        </label>
                                        <select className="select select-bordered w-full text-white" value={pageParent} onChange={(e) => setPageParentAndSlug(e)}>
                                            {
                                                <>
                                                    <option value={0}>No Parent</option>
                                                    {
                                                        pages && pages.length && pages.map(page => (
                                                           <option value={page._id}>{page.Title}</option>
                                                        ))
                                                    }
                                                </>
                                            }
                                        </select>
                                    </div>
                                    <div className="form-control mt-2 w-full mr-2">
                                        <label className="label">
                                            <span className="label-text text-white">Image</span>
                                        </label>
                                        <FileUploader multiple={false} handleChange={addImageToPage} name="images" types={fileTypes} />
                                        <div className="flex flex-wrap mt-2">
                                            {
                                                uploadImage?.image && <span className="flex justify-center content-center  mr-2"><img
                                                    src={uploadImage.image} width="100"
                                                /></span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <>
                        <div className="flex justify-around flex-row flex-wrap w-full">
                            <div className="overflow-scroll flex flex-col justify-center items-center w-full px-5">
                                <Table data={pages} editCall={editCall} deleteCall={deleteCall} setShowImagePopupURL={setShowImagePopupURL} />
                            </div>
                            {
                                showImagePopupURL.length > 0 &&
                                <Lightbox
                                    mainSrc={showImagePopupURL}
                                    onCloseRequest={() => setShowImagePopupURL('')}
                                />
                            }
                        </div>
                    </>
            }
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

export default connect(mapStateToProps, mapDispatchToProps)(PageAdmin)