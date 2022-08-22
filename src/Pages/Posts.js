import React from "react"
import "./Posts.css"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { faUser, faCalendar, faDna, faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { fetchFunc } from "../utils"

const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

function Posts(props) {
  const navigate = useNavigate()
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

  const { data: posts, isLoading: isPostsLoading, isError: isPostsError } = useQuery('posts', () => 
    fetchFunc(`http://localhost:3001/get-posts`, 'GET', {
      'x-access-token': localStorage.getItem('token'),
      'accept': 'application/json',
      'content-type': 'application/json'
    }, null, navigate, 'readAllPosts'),
    {
      refetchOnWindowFocus: false,
      retry: false,
      retryError: false,
      refetchOnError: false
    }
  )   

  const { mutate: likedMutate } = useMutation('like-post', (data) =>
    fetchFunc('http://localhost:3001/like-dislike-posts', 'PUT', {
      'x-access-token': localStorage.getItem('token'),
      'accept': 'application/json',
      'content-type': 'application/json'
    }, JSON.stringify(data), navigate, 'likePosts')
    , {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries('posts')
      }
    }
  )

  const likeUnlike = (postId, isLiked) => {
    likedMutate({
      postId,
      isLiked
    })
  }

  const { mutate: trackingMutate } = useMutation('tracking-action', (data) =>
    fetchFunc('http://localhost:3001/create-tracking', 'POST', {
      'x-access-token': localStorage.getItem('token'),
      'accept': 'application/json',
      'content-type': 'application/json'
    }, JSON.stringify(data), navigate, 'trackingAction')
    , {
      onSuccess: (data, variables, context) => {
      }
    }
  )

  const trackingInfoCapture = (postId, action) => {
    setTimeout(() => {
      trackingMutate({
        postId,
        action
      })
    }, 1000)
  }

  const getHierarchyOfCategory = (categoryId) => {
    let categoryFound = categories.find(category => category._id === categoryId)
    if(categoryFound) {
      if(categoryFound.parent) {
        return getHierarchyOfCategory(categoryFound.parent) + ' > ' + categoryFound.name
      } else {
        return categoryFound.name
      }
    } else {
      return ''
    }
  }

  return (
    <div>
      <div className="posts-container flex justify-center content-center flex-wrap flex-col">
        {isPostsLoading ? <p>Loading...</p> : null}
        {isPostsError ? <p>Error</p> : null}
        {posts?.length && posts?.map((post) => (
          <div className="post-container p-5 bg-white max-w-4xl rounded-xl shadow-xl mb-10" key={post._id} onMouseOver={() => trackingInfoCapture(post._id, 'post-hovered')}>
            <div className="post-title text-2xl flex justify-between">
              <h1>{post.name}</h1>
              <div>
                <FontAwesomeIcon icon={faThumbsUp} onClick={() => likeUnlike(post._id, true)} className={`text-gray-400 hover:text-gray-500 active:text-blue-500 mr-5 ${post.likesDislikes.length > 0 ? post.likesDislikes?.[0]?.liked ? 'text-blue-500' : '' : ''}`} />
                <FontAwesomeIcon icon={faThumbsDown} onClick={() => likeUnlike(post._id, false)} className={`text-gray-400 hover:text-gray-500 active:text-red-500  ${post.likesDislikes.length > 0 ? post.likesDislikes?.[0]?.liked ? '' : 'text-red-500': ''}`} />
              </div>
            </div>
            <div className="post-date">
              <FontAwesomeIcon icon={faCalendar} className="mr-5" />
              {(new Date(post.created_date).toDateString())}</div>
            <div className="post-author">
              <FontAwesomeIcon icon={faUser} className="mr-5" />
              {post.created_by.name}
            </div>
            <div className="post-category">
              <FontAwesomeIcon icon={faDna} className="mr-5" />
              {/* {post.category.name} */}
              {getHierarchyOfCategory(post.category._id)}
            </div>
            <div className="post-img flex justify-center content-center mt-5">
              <img src={`http://localhost:3001/${post.image_urls?.[post.featured_image_index]}`} className="rounded-lg shadow-lg" alt={post.slug} />
            </div>
            <div className="post-description mt-10"><div dangerouslySetInnerHTML={{__html: post.description}}></div></div>
         
            <div className="post-img flex justify-center content-center mt-5">
              {
                post?.image_urls?.map((image, index) =>  <img 
                src={`http://localhost:3001/${image}`} 
                key={index}
                className="rounded-lg shadow-lg mr-2" alt={post.slug}
                width="200" />
                )
              }
            </div>
          </div>
        ))}
        {
          !posts?.length && !isPostsLoading && !isPostsError ? <p>No posts found</p> : null
        }
      </div>
    </div>
  )
}

const mapStateToProps = state => {
  return {
  }
}

const mapDispatchToProps = dispatch => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Posts)