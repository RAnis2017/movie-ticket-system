import React, { useState, useEffect } from "react"
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
import Multiselect from 'multiselect-react-dropdown';

function PostsComparisionGraph(props) {
    const [chartLabels, setChartLabels] = useState([])
    const [chartData, setChartData] = useState([])
    const [posts, setPosts] = useState([])
    const [selectedPosts, setSelectedPosts] = useState([])

    useEffect(() => {
        const postsCount = {}
        selectedPosts.map(post => {
            postsCount[post.slug] = []
            chartLabels.map(date => {
                let postsInteractions = post.likesDislikes.filter(likeDislike => likeDislike.updated_date.split('T')[0] === date)
                let count = postsInteractions.filter(likeDislike => likeDislike.liked === true).length - postsInteractions.filter(likeDislike => likeDislike.liked === false).length
                postsCount[post.slug].push(count)
            })
        })
        console.log(postsCount)

        const dataset = Object.keys(postsCount).map(post => {
            const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);

            const randomRGB = () => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;

            return {
                label: post,
                data: postsCount[post],
                borderColor: randomRGB(),
                tension: 0.1
            }
        }
        )

        setChartData(dataset)
    }, [selectedPosts])

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
                text: 'Comparision Posts Interactions',
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

    const { data: trackings } = useQuery('posts', () =>
        fetchFunc('http://localhost:3001/get-posts', 'GET', {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
        }, null, navigate, 'getPosts'),
        {
            refetchOnWindowFocus: false,
            retryError: false,
            refetchOnError: false,
            onSuccess: (data, variables, context) => {
                let date = moment().add(-1, 'week').startOf("week"), weeklength = 14, dates = [];
                while (weeklength--) {
                    dates.push(date.format("YYYY-MM-DD"));
                    date.add(1, "day")
                }

                setChartLabels(dates)

                setPosts(data)
                setSelectedPosts(data)

                const postsCount = {}
                data.map(post => {
                    postsCount[post.slug] = []
                    dates.map(date => {
                        let postsInteractions = post.likesDislikes.filter(likeDislike => likeDislike.updated_date.split('T')[0] === date)
                        let count = postsInteractions.filter(likeDislike => likeDislike.liked === true).length - postsInteractions.filter(likeDislike => likeDislike.liked === false).length
                        postsCount[post.slug].push(count)
                    })
                })
                console.log(postsCount)

                const dataset = Object.keys(postsCount).map(post => {
                    const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);

                    const randomRGB = () => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;

                    return {
                        label: post,
                        data: postsCount[post],
                        borderColor: randomRGB(),
                        tension: 0.1
                    }
                }
                )

                setChartData(dataset)
            }
        }
    )

    const navigate = useNavigate()

    const onSelectPost = (selectedList, selectedItem) => {
        setSelectedPosts(selectedList)
    }

    const onRemovePost = (selectedList, removedItem) => {
        setSelectedPosts(selectedList)
    }

    return (
        <div>
            <div className="chart-container flex justify-center" >
                <div className="max-w-lg w-fit">
                <Multiselect
                    options={posts}
                    selectedValues={selectedPosts}
                    onSelect={onSelectPost}
                    onRemove={onRemovePost}
                    displayValue="slug"
                />
                </div>
                <div className="mb-20" style={{ height: '30vh', width: '60vw' }}>
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

export default connect(mapStateToProps, mapDispatchToProps)(PostsComparisionGraph)