import React, { useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import 'react-quill/dist/quill.snow.css';
import { fetchFunc } from "../../utils"
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

function LikeDislikeInteractions(props) {
  const [chartLabels, setChartLabels] = useState([])
  const [chartData, setChartData] = useState([])

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

  const navigate = useNavigate()

  return (
    <div className="mb-16">
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

export default connect(mapStateToProps, mapDispatchToProps)(LikeDislikeInteractions)