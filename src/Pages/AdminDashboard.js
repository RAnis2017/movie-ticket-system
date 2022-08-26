import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { faCog } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"

function AdminDashboard(props) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!props.token) {
        const isAdmin = localStorage.getItem('isAdmin')
        if (!isAdmin) {
            navigate("/")
        }
    }
  }, [])

  return (
    <div>
      <div className="flex justify-end mr-10 mt-5">
        
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