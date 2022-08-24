import React, { useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { faCog } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"

function AdminDashboard(props) {
  const navigate = useNavigate()

  return (
    <div>
      <div className="flex justify-end mr-10">
        <div className="dropdown dropdown-end">
          <label tabIndex="0" className="btn btn-circle">
            <FontAwesomeIcon icon={faCog} />
          </label>
          <ul tabIndex="0" className="dropdown-content menu p-2 mt-2 shadow bg-base-100 bg-slate-500 text-black rounded-box w-52">
            <li className="hover:text-white" onClick={() => navigate('/admin/movies')}><a>Movies</a></li>
            <li className="hover:text-white" onClick={() => navigate('/admin/movies')}><a>Settings</a></li>
          </ul>
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

export default connect(mapStateToProps, mapDispatchToProps)(AdminDashboard)