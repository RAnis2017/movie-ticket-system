import React, { useState } from "react"
import { connect } from "react-redux"
import { useGoogleLogout } from 'react-google-login'
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import {  faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"
const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function UsersAdmin(props) {
  const queryClient = useQueryClient()
  const [updatingUser, setUpdatingUser] = useState(null)

  const { isLoading: usersLoading, isSuccess: usersSuccess, data: users } = useQuery('users', () =>
    fetchFunc('http://localhost:3001/admin/users', 'GET', {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token'),
    }, null, navigate, 'readAllUsers'),
    {
      refetchOnWindowFocus: false,
      retryError: false,
      refetchOnError: false
    }
  )

  const { isLoading: permissionsLoading, isSuccess: permissionsSuccess, data: permissions } = useQuery('permissions', () =>
    fetchFunc('http://localhost:3001/admin/permissions', 'GET', {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token'),
    }, null, navigate, 'readAllPermissions'),
    {
      refetchOnWindowFocus: false,
      retryError: false,
      refetchOnError: false
    }
  )

  const { mutate: permissionUpdateMutate, isSuccess: permissionUpdateIsSuccess, isLoading: permissionUpdateIsLoading, isError: permissionUpdateIsError } = useMutation('update-user-permissions', (data) =>
    fetchFunc('http://localhost:3001/admin/add-user-permission/'+data.userId, 'PUT', {
      'x-access-token': localStorage.getItem('token'),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }, JSON.stringify(data), navigate, 'updateUserPermissions')
    , {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('users')
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
  
  const formatPermissions = (permissions) => {
    let formattedPermissions = []
    permissions.forEach(permission => {
        formattedPermissions.push(permission.name)
    }
    )

    formattedPermissions = formattedPermissions.join(', ')
    return (
        <>
        {
        permissions.map(permission => 
        <span key={permission.label}>{permission.name}, <br /></span>
        )
        }
        </>
    )
    }

  // dynamic table component
  const Table = ({ data }) => {
    return (
      <>
        <table className="table table-striped table-fixed">
          <thead>
            <tr>
              <th className="">Name</th>
                <th className="">Email</th>
                <th className="">Created Date</th>
                <th className="">Updated Date</th>
                <th className="w-1/2">Permissions</th>
              <th className="">Actions</th>
            </tr>
          </thead>
          <tbody className="">
            {data?.length && data?.map(item => (
              <tr key={item._id}>
                <>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.created_date}</td>
                    <td>{item.updated_date}</td>
                    <td className="max-w-md break-normal">{formatPermissions(item.permissions)}</td>
                </>
                <td>
                  <button className="btn btn-circle ml-2" onClick={() => setUpdatingUser(item)}>
                    <FontAwesomeIcon icon={faPen} />
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

  const checkIfUserHasPermission = (user, permission) => {
    let hasPermission = false
    user.permissions.forEach(userPermission => {
      if (userPermission._id === permission) {
        hasPermission = true
      }
    }
    )
    return hasPermission
  }

  const addRemovePermissionFromUser = (permissionId, alreadyExist) => {
    const user = updatingUser
    if(alreadyExist) {
      user.permissions = user.permissions.filter(permission => permission._id !== permissionId)
    }
    else {
      user.permissions.push(permissions.find(permission => permission._id === permissionId))
    }

    setUpdatingUser(user)

    permissionUpdateMutate({
      userId: user._id,
      permissions: user.permissions
    })

  }

  return (
    <div>
      <div className="flex justify-around flex-row flex-wrap">
        <div className=" h-80 overflow-scroll flex flex-col justify-center items-center">
          <h1 className="mb-5">Users</h1>
          {
            usersLoading ?
              <div className="flex justify-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
              : <></>
          }
          <Table data={users} />
        </div>
      </div>

      {
        updatingUser ?
        <div className="flex justify-center mt-5 mb-10">
            <div className="w-6/12 bg-slate-700 rounded-lg p-5 shadow-lg flex justify-center flex-row">
              <div className="w-full max-w-md">
                <h1 className="text-xl text-center">Assign/Remove Permissions</h1>

                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text text-white">Name</span>
                  </label>
                  <input type="text" placeholder="Type here" value={updatingUser.name} disabled={true} className="input input-ghost w-full max-w-md" />
                </div>

                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text text-white">Permissions</span>
                  </label>
                  <div className="flex flex-wrap justify-between content-center">
                    {
                      permissions?.length && permissions?.map(permission => (
                        <div key={permission._id} className="flex items-center mr-2">
                          <input type="checkbox" id={`perm-${permission._id}`} checked={checkIfUserHasPermission(updatingUser, permission._id)} className="input input-ghost" onChange={() => addRemovePermissionFromUser(permission._id, checkIfUserHasPermission(updatingUser, permission._id))} />
                          <label className="text-white ml-2" htmlFor={`perm-${permission._id}`}>{permission.name}</label>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div> : <></>
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

export default connect(mapStateToProps, mapDispatchToProps)(UsersAdmin)