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

const fileTypes = ["JPG", "PNG", "GIF"];

// dynamic table component
const Table = ({ data, editCall, deleteCall }) => {
    return (
        <>
            <table className="table table-striped relative z-0 text-white">
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
                            <td className="truncate" title={item.release_date}>{item.release_date}</td>
                            <td className="truncate" title={item.category}>{item.category}</td>
                            <td className="truncate">
                                <a className="btn btn-sm btn-circle" title={item.image_url?.[0]} href={`http://localhost:3001/${item.image_urls?.[0]}`} target="_blank">
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

function MoviesAdmin(props) {
    const [addMovieClicked, setAddMovieClicked] = useState(false)
    const [addMovieTitle, setAddMovieTitle] = useState('')
    const [addMovieDirector, setAddMovieDirector] = useState('')
    const [addMovieReleaseDate, setAddMovieReleaseDate] = useState('')
    const [addMovieActors, setAddMovieActors] = useState('')
    const [addMovieDescription, setAddMovieDescription] = useState('')
    const [addMovieCategory, setAddMovieCategory] = useState('')
    const [addMovieImage, setAddMovieImage] = useState('')
    const [isMovieUpdating, setIsMovieUpdating] = useState(false)
    const [uploadMultiple, setUploadMultiple] = useState([])
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    useEffect(() => {
        if (!props.token) {
            const isAdmin = localStorage.getItem('isAdmin')
            if (!isAdmin) {
                navigate("/")
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

    const { isLoading: moviesLoading, isSuccess: moviesSuccess, data: movies } = useQuery('movies', () =>
        fetchFunc('http://localhost:3001/get-movies', 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'readAllMovies'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false
        }
    )

    const { mutate: movieMutate, isSuccess: movieIsSuccess, isLoading: movieIsLoading, isError: movieIsError } = useMutation('add-movie', (data) =>
        fetchFunc('http://localhost:3001/admin/add-movie', 'POST', {
            'x-access-token': localStorage.getItem('token'),
        }, data, navigate, 'addMovie')
        , {
            onSuccess: (data, variables, context) => {
                queryClient.invalidateQueries('movies')
                setAddMovieClicked(false)
                setAddMovieTitle('')
                setAddMovieDirector('')
                setAddMovieReleaseDate('')
                setAddMovieActors('')
                setAddMovieDescription('')
                setAddMovieCategory('')
                setAddMovieImage('')
                setUploadMultiple([])
            }
        }
    )

    const deleteCall = (id) => {
        movieMutateDelete.mutate({
            id
        })
    }

    const editCall = (id) => {
        setAddMovieClicked(true)
        setAddMovieTitle(movies.find(movie => movie._id === id).title)
        setAddMovieDescription(movies.find(movie => movie._id === id).description)
        setAddMovieDirector(movies.find(movie => movie._id === id).director)
        setAddMovieReleaseDate(movies.find(movie => movie._id === id).release_date)
        setAddMovieActors(movies.find(movie => movie._id === id).actors)
        setAddMovieCategory(movies.find(movie => movie._id === id).category)
        setIsMovieUpdating(id)

        let movie = movies.find(movie => movie._id === id)
        let images = []
        Promise.all(movie.image_urls.map(async (image) => {
            return new Promise(async (resolve, reject) => {
                let img = await createFile(image)
                images.push(img)
                resolve()
            })
        })).then((res) => {
            setAddMovieImage(images)
            let imagesTemp = []
            for (let i = 0; i < images.length; i++) {
                imagesTemp.push({
                    name: images[i].name,
                    image: URL.createObjectURL(images[i]),
                })
            }
            setUploadMultiple(imagesTemp)
        })

    }


    const movieMutateDelete = useMutation('delete-movie', (data) =>
        fetchFunc(`http://localhost:3001/admin/delete-movie/${data.id}`, 'DELETE', {
            'x-access-token': localStorage.getItem('token'),
            'accept': 'application/json',
            'content-type': 'application/json'
        }, null, navigate, 'deleteMovie'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('movies')
        }
    }
    )


    const { mutate: movieUpdateMutate } = useMutation('update-movie', (data) =>
        fetchFunc(`http://localhost:3001/admin/update-movie/${isMovieUpdating}`, 'PUT', {
            'x-access-token': localStorage.getItem('token'),
        }, data, navigate, 'updateMovie'), {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('movies')
            setAddMovieClicked(false)
            setAddMovieTitle('')
            setAddMovieDescription('')
            setAddMovieDirector('')
            setAddMovieReleaseDate('')
            setAddMovieActors('')
            setAddMovieCategory('')
            setAddMovieImage('')
            setUploadMultiple([])
            setIsMovieUpdating(false)
        }
    }
    )


    const addNewMovie = () => {
        setAddMovieClicked((prev) => !prev)
    }

    const saveNewMovie = () => {
        const data = new FormData()
        if (addMovieImage.length != 0) {
            for (const single_file of addMovieImage) {
                data.append('images', single_file)
            }
        }
        data.append('title', addMovieTitle)
        data.append('description', addMovieDescription)
        data.append('director', addMovieDirector)
        data.append('release_date', addMovieReleaseDate)
        data.append('actors', addMovieActors)
        data.append('category', addMovieCategory)

        if (isMovieUpdating) {
            movieUpdateMutate(data)
        } else {
            movieMutate(data)
        }
    }

    const addImageToMovie = (files) => {
        setAddMovieImage(files)
        let images = []
        for (let i = 0; i < files.length; i++) {
            images.push({
                name: files[i].name,
                image: URL.createObjectURL(files[i]),
            })
        }

        setUploadMultiple(images)

    }


    return (
        <div className="text-gray-700 min-h-screen">
            <div className="flex justify-end">
                <div className="mt-5 mr-5">
                    {
                        addMovieClicked ?
                            <button className="btn btn-success" onClick={() => saveNewMovie()}>{movieIsLoading ? 'Saving...' : isMovieUpdating ? 'Update Movie' : 'Save Movie'}</button>
                            :
                            <button className="btn btn-primary" onClick={() => addNewMovie()}>Add Movie</button>
                    }
                </div>
            </div>
            {
                addMovieClicked ?
                    <div className="flex justify-center mt-5">
                        <div className="w-6/12 bg-slate-700 rounded-lg p-5 shadow-lg flex justify-center flex-row">
                            <div className="w-full max-w-md">
                                <div className="form-control w-full max-w-md">
                                    <label className="label">
                                        <span className="label-text text-white">Title</span>
                                    </label>
                                    <input type="text" placeholder="Type here" value={addMovieTitle} onChange={(e) => setAddMovieTitle(e.target.value)} className="input input-ghost text-white w-full max-w-md" />
                                </div>
                                <div className="form-control w-full max-w-md">
                                    <label className="label">
                                        <span className="label-text text-white">Director</span>
                                    </label>
                                    <input type="text" placeholder={"Director Name"} value={addMovieDirector} onChange={(e) => setAddMovieDirector(e.target.value)} className="input input-ghost text-white w-full max-w-md" />
                                </div>
                                <div className="form-control w-full max-w-md">
                                    <label className="label">
                                        <span className="label-text text-white">Release Date</span>
                                    </label>
                                    <input type="datetime-local" placeholder={"Release Date"} value={addMovieReleaseDate} onChange={(e) => setAddMovieReleaseDate(e.target.value)} className="input input-ghost text-white w-full max-w-md" />
                                </div>
                                <div className="form-control w-full max-w-md">
                                    <label className="label">
                                        <span className="label-text text-white">Actors</span>
                                    </label>
                                    <input type="text" placeholder={"Actors' Name"} value={addMovieActors} onChange={(e) => setAddMovieActors(e.target.value)} className="input input-ghost text-white w-full max-w-md" />
                                </div>
                                <div className="form-control w-full max-w-md">
                                    <label className="label">
                                        <span className="label-text text-white">Category</span>
                                    </label>
                                    <input type="text" placeholder={"Category Name"} value={addMovieCategory} onChange={(e) => setAddMovieCategory(e.target.value)} className="input input-ghost text-white w-full max-w-md" />
                                </div>
                                <div className="form-control w-full max-w-md">
                                    <label className="label">
                                        <span className="label-text text-white">Description</span>
                                    </label>
                                    <ReactQuill className="bg-slate-800 text-white border-transparent" theme="snow" value={addMovieDescription} onChange={(e) => { setAddMovieDescription(e) }} />
                                </div>
                                <div className="form-control w-full max-w-md">
                                    <label className="label">
                                        <span className="label-text text-white">Image</span>
                                    </label>
                                    <FileUploader multiple={true} handleChange={addImageToMovie} name="images" types={fileTypes} />
                                </div>
                                <div className="flex flex-wrap mt-2">
                                    {
                                        uploadMultiple.map((image, index) => <span className="flex justify-center content-center  mr-2"><img
                                            src={image.image} width="100"
                                        /></span>)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <>
                    <div className="flex justify-around flex-row flex-wrap">
                        <div className="overflow-scroll flex flex-col justify-center items-center">
                            <Table data={movies} editCall={editCall} deleteCall={deleteCall} />
                        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(MoviesAdmin)