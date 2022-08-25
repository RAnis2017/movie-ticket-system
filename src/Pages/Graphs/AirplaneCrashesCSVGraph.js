import React, { useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import { fetchFunc } from "../../utils"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from "moment"

function AirplaneCrashesCSVGraph(props) {
  const [chartLabels, setChartLabels] = useState([])
  const [chartData, setChartData] = useState([])

  //Chart JS Options
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Airplane Crashes Per Year',
      },
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 1,
        to: 0,
        loop: false
      }
    }
  };

  const { data: trackings } = useQuery('trackings', () =>
    fetchFunc('http://localhost:3001/airplane_crashes_data', 'GET', {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token'),
    }, null, navigate, 'getTrackings'),
    {
      refetchOnWindowFocus: false,
      retryError: false,
      refetchOnError: false,
      onSuccess: (data, variables, context) => {
          
        setChartLabels(Object.keys(data))

        const dataset = [{
          label: 'Airplane Crashes Count',
          data: Object.values(data), 
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1
        }]
        setChartData(dataset)
      }
    }
  )

  const navigate = useNavigate()

  return (
    <div>
      <div className="chart-container flex justify-center" >
        <div className="mb-20" style={{height: '30vh', width: '80vw'}}>
          <Line options={options} data={{
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

export default connect(mapStateToProps, mapDispatchToProps)(AirplaneCrashesCSVGraph)