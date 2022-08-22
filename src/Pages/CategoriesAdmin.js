import React, { useState } from "react"
import { connect } from "react-redux"
import { useGoogleLogout } from 'react-google-login'
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"
const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function CategoriesAdmin(props) {
  const [addCategoryClicked, setAddCategoryClicked] = useState(false)
  const [addCategoryName, setAddCategoryName] = useState('')
  const [isCategoryUpdating, setIsCategoryUpdating] = useState(false)
  const [addParentCategory, setAddParentCategory] = useState('')

  const queryClient = useQueryClient()

  const { isLoading: categoriesLoading, isSuccess: categoriesSuccess, data: categories } = useQuery('categories', () =>
    fetchFunc('http://localhost:3001/get-categories?admin=true', 'GET', {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token'),
    }, null, navigate, 'readAllCategories'),
    {
      refetchOnWindowFocus: false,
      retryError: false,
      refetchOnError: false
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
    categoryMutateDelete.mutate({
      id
    })
  }

  const editCall = (id) => {
    setAddCategoryClicked(true)
    let categoryFound = categories.find(category => category._id === id)
    setAddCategoryName(categoryFound.name)
    let categoryParentFound = categories.find(category => category._id === categoryFound.parent)
    if(categoryParentFound) {
      setAddParentCategory(categoryParentFound._id)
    }
    setIsCategoryUpdating(id)
  }

  const categoryMutateDelete = useMutation('delete-category', (data) =>
    fetchFunc(`http://localhost:3001/admin/delete-category/${data.id}`, 'DELETE', {
      'x-access-token': localStorage.getItem('token'),
      'accept': 'application/json',
      'content-type': 'application/json'
    }, null, navigate, 'deleteCategory'), {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('categories')
    }
  }
  )

  const { mutate: categoryUpdateMutate } = useMutation('update-category', (data) =>
    fetchFunc(`http://localhost:3001/admin/update-category/${isCategoryUpdating}`, 'PUT', {
      'x-access-token': localStorage.getItem('token'),
      'accept': 'application/json',
      'content-type': 'application/json'
    }, JSON.stringify(data), navigate, 'updateCategory'), {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('categories')
      setAddCategoryClicked(false)
      setAddCategoryName('')
      setIsCategoryUpdating(false)
    }
  }
  )


  // dynamic table component
  const Table = ({ data }) => {
    return (
      <>
        <table className="table table-striped relative">
          <thead>
            <tr>
              <th className="sticky top-0">Name</th>
              <th className="sticky top-0">Actions</th>
            </tr>
          </thead>
          <tbody className="">
            {data?.length && data?.map(item => (
              <tr key={item._id}>
                <>
                  <td>{item.name}</td>
                </>
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

  const addNewCategory = () => {
    setAddCategoryClicked((prev) => !prev)
  }

  const saveNewCategory = () => {
    if (isCategoryUpdating) {
      categoryUpdateMutate({ name: addCategoryName, parent: addParentCategory })
    } else {
      categoryMutate({ name: addCategoryName, parent: addParentCategory })
    }
  }

  return (
    <div>
      <div className="flex justify-around flex-row flex-wrap">
        <div className=" h-80 overflow-scroll flex flex-col justify-center items-center">
          <h1 className="mb-5">Categories</h1>
          {
            categoriesLoading ?
              <div className="flex justify-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
              : <></>
          }
          <Table data={categories} isCategory={true} />
        </div>
      </div>

      <div className="flex justify-end">
        <div className=" w-1/3 mt-10">
          {
            addCategoryClicked ?
              <button className="btn btn-success ml-3" onClick={() => saveNewCategory()}>{categoryIsLoading ? 'Saving...' : isCategoryUpdating ? 'Update Category' : 'Save Category'}</button>
              :
              <button className="btn btn-primary ml-3" onClick={() => addNewCategory()}>Add Category</button>
          }
        </div>
      </div>

      {
        addCategoryClicked ?
          <div className="flex justify-center mt-5 mb-10">
            <div className="w-6/12 bg-slate-700 rounded-lg p-5 shadow-lg flex justify-center flex-row">
              <div className="w-full max-w-md">
                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text text-white">Name</span>
                  </label>
                  <input type="text" placeholder="Type here" value={addCategoryName} onChange={(e) => setAddCategoryName(e.target.value)} className="input input-ghost w-full max-w-md" />
                </div>
                <div className="form-control w-full max-w-md">
                  <select className="input input-ghost w-full max-w-md" value={addParentCategory} onChange={(e) => setAddParentCategory(e.target.value)}>
                    <option value={''}>Select Parent Category</option>
                    {
                      categories.map(item => (
                        <option key={item._id} value={item._id}>{item.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>
          </div>
          :
          <></>
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesAdmin)