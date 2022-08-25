import React, { useState } from "react"
import "./PostsAdmin.css"
import { connect } from "react-redux"
import { useGoogleLogout } from 'react-google-login'
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faTrash, faPen, faCheck, faCancel, faImage, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchFunc } from "../utils"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FileUploader } from "react-drag-drop-files";
import DropdownTreeSelect from 'react-dropdown-tree-select'
import 'react-dropdown-tree-select/dist/styles.css'

const fileTypes = ["JPG", "PNG", "GIF"];

const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function PostsAdmin(props) {
  const [addPostClicked, setAddPostClicked] = useState(false)
  const [addCategoryClicked, setAddCategoryClicked] = useState(false)
  const [addPostTitle, setAddPostTitle] = useState('')
  const [addPostDescription, setAddPostDescription] = useState('')
  const [addPostCategory, setAddPostCategory] = useState('')
  const [addParentCategory, setAddParentCategory] = useState('')
  const [addPostImage, setAddPostImage] = useState('')
  const [addPostStatus, setAddPostStatus] = useState('')
  const [addCategoryName, setAddCategoryName] = useState('')
  const [isPostUpdating, setIsPostUpdating] = useState(false)
  const [uploadMultiple, setUploadMultiple] = useState([])
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);

  const [addCategoryFromPost, setAddCategoryFromPost] = useState(false)
  const [chartLabels, setChartLabels] = useState([])
  const [chartData, setChartData] = useState([])
  const queryClient = useQueryClient()
  
  const onChange = (currentNode, selectedNodes) => {
    console.log('onChange::', currentNode, selectedNodes)
  }

  //Chart JS Options
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Posts Likes/Dislikes Interaction Per User',
        color: '#fff',
        font: {
          size: 20,
          weight: 'bold',
        }
      },
    },
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: '#fff',
          font: {
            size: 13,
          }
        }
      },
      y: {
        stacked: true,
        ticks: {
          color: '#fff',
          font: {
            size: 13,
          }
        }
      },
    },
  };

  async function createFile(url){
    let response = await fetch(`http://localhost:3001/${url}`);
    let data = await response.blob();
    let metadata = {
      type: 'image/jpeg'
    };
    let file = new File([data], url, metadata);
    
    return file
  }

  const { isLoading: postsLoading, isSuccess: postsSuccess, data: posts } = useQuery('posts', () =>
    fetchFunc('http://localhost:3001/get-posts', 'GET', {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token'),
    }, null, navigate, 'readAllPosts'),
    {
      refetchOnWindowFocus: false,
      retryError: false,
      refetchOnError: false,
      onSuccess: (data) => {
        setChartLabels(data.map(post => post.slug))
        const datasets = [
          {
            label: 'Likes',
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5',
            data: data.map(post => post.likesDislikes.filter(like => like.liked).length),
            stack: '0',
          }, 
          {
            label: 'Dislikes',
            backgroundColor: '#ff4d4d',
            borderColor: '#ff3333',
            data: data.map(post => -(post.likesDislikes.filter(like => !like.liked).length)),
            stack: '1',
          }
        ]

        setChartData(datasets)
      }
    }
  )

  const { isLoading: categoriesLoading, isSuccess: categoriesSuccess, data: categories } = useQuery(['categories', addPostCategory], () => {
    return fetchFunc('http://localhost:3001/get-categories?id='+addPostCategory, 'GET', {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token'),
    }, null, navigate, 'readAllCategories')
    },
    {
      refetchOnWindowFocus: false,
      retryError: false,
      refetchOnError: false
    }
  )

  const { isLoading: categoriesAdminLoading, isSuccess: categoriesAdminIsSuccess, data: categoriesAdmin } = useQuery('categories', () => {
    return fetchFunc('http://localhost:3001/get-categories?admin=true', 'GET', {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token'),
    }, null, navigate, 'readAllCategories')
    },
    {
      refetchOnWindowFocus: false,
      retryError: false,
      refetchOnError: false
    }
  )

  const { mutate: postMutate, isSuccess: postIsSuccess, isLoading: postIsLoading, isError: postIsError } = useMutation('add-post', (data) =>
    fetchFunc('http://localhost:3001/admin/add-post', 'POST', {
      'x-access-token': localStorage.getItem('token'),
    }, data, navigate, 'addPost')
    , {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('posts')
        setAddPostClicked(false)
        setAddPostTitle('')
        setAddPostDescription('')
        setAddPostCategory('')
        setAddPostImage('')
        setUploadMultiple([])
        setFeaturedImageIndex(0)
        setAddPostStatus('')
      }
    }
  )

  const { mutate: categoryMutate, isSuccess: categoryIsSuccess, isLoading: categoryIsLoading, isError: categoryIsError } = useMutation('add-category', (data) =>
    fetchFunc('http://localhost:3001/admin/add-category', 'POST', {
      'x-access-token': localStorage.getItem('token'),
      'accept': 'application/json',
      'content-type': 'application/json'
    }, JSON.stringify(data), navigate, 'addCategory')
    , {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('categories')
        setAddCategoryClicked(false)
        setAddCategoryName('')
      }
    }
  )

  const navigate = useNavigate()
  const onLogoutSuccess = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    navigate('/')
  }

  const onFailure = () => {
    console.log('logout failed')
  }

  const { signOut } = useGoogleLogout({
    clientId,
    onLogoutSuccess,
    onFailure,
  })

  const deleteCall = (id) => {
    postMutateDelete.mutate({
      id
    })
  }

  const editCall = (id) => {
    setAddPostClicked(true)
    setAddPostTitle(posts.find(post => post._id === id).name)
    setAddPostDescription(posts.find(post => post._id === id).description)
    setAddPostCategory(posts.find(post => post._id === id).category._id)
    setAddPostStatus(posts.find(post => post._id === id).status === 'true' ? true : false)
    setFeaturedImageIndex(posts.find(post => post._id === id).featured_image_index)
    setFeaturedImageIndex(0)
    setIsPostUpdating(id)
    
    let post = posts.find(post => post._id === id)
    let images = []
    Promise.all(post.image_urls.map(async (image) => {
      return new Promise(async (resolve,reject) => {
        let img = await createFile(image)
        images.push(img)
        resolve()
      })
    })).then((res) => {
      setAddPostImage(images)
      let imagesTemp = []
      for(let i = 0; i < images.length; i++) {
        imagesTemp.push({
          name: images[i].name, 
          image: URL.createObjectURL(images[i]), 
        })
      }
      setUploadMultiple(imagesTemp)
    })

  }

  const changeStatusCall = (id, status) => {
    postMutateChangeStatus.mutate({
      id,
      status
    })
  }

  const postMutateDelete = useMutation('delete-post', (data) =>
    fetchFunc(`http://localhost:3001/admin/delete-post/${data.id}`, 'DELETE', {
      'x-access-token': localStorage.getItem('token'),
      'accept': 'application/json',
      'content-type': 'application/json'
    }, null, navigate, 'deletePost'), {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('posts')
    }
  }
  )

  const postMutateChangeStatus = useMutation('change-status', (data) =>
    fetchFunc(`http://localhost:3001/admin/change-status/${data.id}`, 'PUT', {
      'x-access-token': localStorage.getItem('token'),
      'accept': 'application/json',
      'content-type': 'application/json'
    }, JSON.stringify(data), navigate, 'changeStatus')
    , {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('posts')
      }
    }
  )

  const { mutate: postUpdateMutate } = useMutation('update-post', (data) =>
    fetchFunc(`http://localhost:3001/admin/update-post/${isPostUpdating}`, 'PUT', {
      'x-access-token': localStorage.getItem('token'),
    }, data, navigate, 'updatePost'), {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('posts')
      setAddPostClicked(false)
      setAddPostTitle('')
      setAddPostDescription('')
      setAddPostCategory('')
      setAddPostImage('')
      setAddPostStatus('')
      setUploadMultiple([])
      setIsPostUpdating(false)
    }
  }
  )

  // dynamic table component
  const Table = ({ data }) => {
    return (
      <>
      <table className="table table-striped relative z-0">
        <thead>
          <tr>
            <th className="sticky top-0">Title</th>
            <th className="sticky top-0">Author</th>
            <th className="sticky top-0">Slug</th>
            <th className="sticky top-0">Category</th>
            <th className="sticky top-0">Status</th>
            <th className="sticky top-0">Image</th>
            <th className="sticky top-0">Actions</th>
          </tr>
        </thead>
        <tbody className="">
          {data?.length && data?.map(item => (
            <tr key={item._id}>
              <td className="truncate max-w-[200px]" title={item.name}>{item.name}</td>
              <td className="truncate max-w-[100px]" title={item.created_by?.name}>{item.created_by?.name}</td>
              <td className="truncate max-w-[100px]" title={item.slug}>{item.slug}</td>
              <td className="truncate max-w-[100px]" title={item.category?.name}>{item.category?.name}</td>
              <td className={`truncate max-w-xs ${item.status === 'true' ? 'text-green-400' : 'text-red-400'}`}>{item.status === 'true' ? 'Active' : 'Inactive'}</td>
              <td className="truncate max-w-xs">
                <a className="btn btn-sm btn-circle" title={item.image_url?.[0]} href={`http://localhost:3001/${item.image_urls?.[0]}`} target="_blank">
                  <FontAwesomeIcon icon={faImage} className="text-blue-400" />
                </a>
              </td>
              <td>
                <button className="btn btn-circle" onClick={() => changeStatusCall(item._id, item.status)}>
                  {
                    item.status === 'true' ?
                      <FontAwesomeIcon className="text-red-400" icon={faCancel} /> :
                      <FontAwesomeIcon className="text-green-400" icon={faCheck} />
                  }
                </button>
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

  const addNewPost = () => {
    setAddCategoryClicked(false)
    setAddPostClicked((prev) => !prev)
  }

  const saveNewPost = () => {
    const data = new FormData()
    if (addPostImage.length != 0) {
      for (const single_file of addPostImage) {
          data.append('images', single_file)
      }
    }
    data.append('title', addPostTitle)
    data.append('description', addPostDescription)
    data.append('category', addPostCategory)
    data.append('slug', convertToSlug(addPostTitle))
    data.append('status', addPostStatus)
    data.append('featured_image_index', featuredImageIndex)

    if (isPostUpdating) {
      postUpdateMutate(data)
    } else {
      postMutate(data)
    }
  }

  const convertToSlug = (text) => {
    return text?.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  const addImageToPost = (files) => {
    setAddPostImage(files)
    let images = []
    for(let i = 0; i < files.length; i++) {
      images.push({
        name: files[i].name, 
        image: URL.createObjectURL(files[i]), 
      })
    }

    setUploadMultiple(images)
    
  }

  const setAddCategoryFromPostConditions = () => {

    if(addCategoryFromPost && addCategoryName.length > 0) {
      categoryMutate({ name: addCategoryName, parent: addParentCategory })

      setAddCategoryName('')
      setAddParentCategory('')

      setTimeout(() => {
        setAddPostCategory(categories[categories.length - 1]._id)
      }, 1000)
    }

    setAddCategoryFromPost((prev) => !prev)
  }

  return (
    <div className="mb-16">
      <div className="flex justify-around flex-row flex-wrap">
        <div className=" h-80 overflow-scroll flex flex-col justify-center items-center">
          <h1 className="mb-5">Posts</h1>
          <Table data={posts} />
        </div>
      </div>

      <div className="flex justify-end">
        <div className=" w-1/3 mt-10">
          {
            addPostClicked ?
              <button className="btn btn-success" onClick={() => saveNewPost()}>{postIsLoading ? 'Saving...' : isPostUpdating ? 'Update Post' : 'Save Post'}</button>
              :
              <button className="btn btn-primary" onClick={() => addNewPost()}>Add Post</button>
          }
        </div>
      </div>
      {
        addPostClicked ?
          <div className="flex justify-center mt-5 mb-10">
            <div className="w-6/12 bg-slate-700 rounded-lg p-5 shadow-lg flex justify-center flex-row">
              <div className="w-full max-w-md">
                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text text-white">Title</span>
                  </label>
                  <input type="text" placeholder="Type here" value={addPostTitle} onChange={(e) => setAddPostTitle(e.target.value)} className="input input-ghost w-full max-w-md" />
                </div>
                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text text-white">Slug</span>
                  </label>
                  <input type="text" disabled={true} placeholder={"Auto generated slug"} value={convertToSlug(addPostTitle)} className="input input-ghost w-full max-w-md" />
                </div>

                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text text-white">Category</span>
                  </label>
                  <div className="flex justify-between content-center">
                  {
                    addCategoryFromPost === false ?
                    <>
                      {
                        categories?.length > 0 ?
                        <DropdownTreeSelect data={categories} className="input input-ghost w-full max-w-md treeView" onChange={(e) => setAddPostCategory(e.value)} />
                        : <></>
                      }
                    </>: 
                    <>
                      <input type="text" placeholder="Type here" value={addCategoryName} onChange={(e) => setAddCategoryName(e.target.value)} className="input input-ghost w-full max-w-md" />
                      <select className="input input-ghost w-full max-w-md" value={addParentCategory} onChange={(e) => setAddParentCategory(e.target.value)}>
                          <option value={''}>Select Parent Category</option>
                          {
                            categoriesAdmin.map(item => (
                              <option key={item._id} value={item._id}>{item.name}</option>
                            ))
                          }
                        </select>
                      </>
                  }
                  
                    <button className="btn btn-circle ml-3" onClick={() => setAddCategoryFromPostConditions()}>
                      {
                        addCategoryFromPost ?
                          addCategoryName.length > 0 ?
                          <FontAwesomeIcon icon={faCheck} fontSize={20} className="text-green-400" />
                          :
                          <FontAwesomeIcon icon={faTimes} fontSize={20} className="text-red-400" />
                          :
                          <FontAwesomeIcon icon={faPlus} fontSize={20} />
                      }
                    </button>
                  </div>
                </div>
                <div className="form-control w-full max-w-md mt-10">
                  <label className="label">
                    <span className="label-text text-white">Status</span>
                  </label>
                  <select className="input input-ghost w-full max-w-md" value={addPostStatus} onChange={(e) => setAddPostStatus(e.target.value)}>
                    <option>Select Status</option>
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text text-white">Description</span>
                  </label>
                  <ReactQuill className="bg-slate-800 border-transparent" theme="snow" value={addPostDescription} onChange={(e) => { setAddPostDescription(e) }} />
                </div>
                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text text-white">Image</span>
                  </label>
                  <FileUploader multiple={true} handleChange={addImageToPost} name="images" types={fileTypes} />
                  {/* <input type="file" multiple='multiple' accept='image/*' name='images' id='file'  placeholder="Insert Post Image" onChange={(e) => addImageToPost(e)} className="input input-ghost w-full max-w-md" /> */}
                </div>
                <div className="flex flex-wrap mt-2">
                  {
                    uploadMultiple.map((image, index) => <span className="flex justify-center content-center  mr-2"><img
                    className={`${index === featuredImageIndex ? 'border-red-600' : 'border-red-400'}  hover:border-red-600 border-8`}
                    src={image.image} width="100"
                    onClick={() => setFeaturedImageIndex(index)}
                    /></span>)
                  }
                </div>
              </div>
            </div>
          </div>
          :
          <></>
      }
      <div className="chart-container flex justify-center" >
        <div className="mb-20" style={{height: '30vh', width: '60vw'}}>
          <Bar options={options} data={{
            labels: chartLabels,
            datasets: chartData
          }} />
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

export default connect(mapStateToProps, mapDispatchToProps)(PostsAdmin)