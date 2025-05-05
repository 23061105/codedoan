import {
  Bell,
  Bookmark,
  LineChartIcon as ChartLine,
  Compass,
  Edit,
  EllipsisIcon as EllipsisHorizontal,
  Home,
  ImageIcon,
  MessageSquare,
  Palette,
  Search,
  Settings,
  Share,
  ThumbsUp,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ChatContainer from "../Components/ChatContainer.jsx";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { usePostStore } from "../store/usePostStore.js";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const SocialHome = () => {
  // Quản lý hiển thị popup và lưu thông tin cuộc hội thoại được chọn
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const { users, getUsers, isUsersLoading, setSelectedUser } = useChatStore();
  const { authUser, onlineUsers, connectSocket } = useAuthStore();
  const { 
    posts, 
    getPosts, 
    isLoading, 
    createPost, 
    likePost, 
    addComment, 
    deletePost, 
    isCreatingPost, 
    loadMorePosts,
    pagination
  } = usePostStore();

  // State for post creation
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState({});
  const [commentText, setCommentText] = useState({});
  const fileInputRef = useRef(null);

  // Fetch users, ensure socket connection, and load posts when component mounts
  useEffect(() => {
    getUsers();
    getPosts();

    // Ensure socket connection is established
    if (authUser && authUser._id) {
      connectSocket();
    }
  }, [getUsers, connectSocket, authUser, getPosts]);

  // Handle post image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setPostImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle creating a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!postText.trim() && !postImage) {
      toast.error("Post cannot be empty");
      return;
    }
    
    const result = await createPost({
      text: postText.trim(),
      image: postImage
    });
    
    if (result) {
      setPostText("");
      setPostImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle liking a post
  const handleLikePost = async (postId) => {
    await likePost(postId);
  };

  // Handle adding a comment
  const handleAddComment = async (postId) => {
    if (!commentText[postId] || !commentText[postId].trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    await addComment(postId, commentText[postId]);
    setCommentText(prev => ({ ...prev, [postId]: "" }));
    setShowCommentInput(prev => ({ ...prev, [postId]: false }));
  };

  // Handle deleting a post
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId);
    }
  };

  // Handle showing/hiding comment input
  const toggleCommentInput = (postId) => {
    setShowCommentInput(prev => ({ 
      ...prev, 
      [postId]: !prev[postId] 
    }));
  };

  // Format date for display
  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Subscribe to new messages for notifications when chat window is closed
  useEffect(() => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      const handleNewMessage = (newMessage) => {
        // Only show notification if chat popup is not open
        if (!showMessagePopup) {
          // Find the sender in the users list
          const sender = users.find((user) => user._id === newMessage.senderId);
          if (sender) {
            toast.success(`New message from ${sender.fullName}`);
          }
        }
      };

      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [showMessagePopup, users]);

  // Khi người dùng click vào tin nhắn, lưu lại thông tin cuộc hội thoại và mở modal
  const handleMessageClick = (user) => {
    setSelectedUser(user);
    setShowMessagePopup(true);
    toast.success(`Chat started with ${user.fullName}`);
  };

  // Check if a user is online
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // Check if current user has liked a post
  const hasLikedPost = (post) => {
    return post.likes?.some(like => like === authUser?._id);
  };
  
  // Load more posts when user scrolls to bottom
  const handleLoadMorePosts = () => {
    if (pagination.currentPage < pagination.totalPages && !isLoading) {
      loadMorePosts();
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="w-full bg-white py-3 fixed top-0 z-10">
        <div className="w-[80%] mx-auto flex items-center justify-between">
          <h2 className="font-bold text-xl">nokoSocial</h2>
          <div className="bg-gray-100 rounded-full py-2 px-4 hidden md:flex items-center">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="search"
              placeholder="Search for creators, inspirations, and projects"
              className="bg-transparent w-[30vw] ml-4 text-sm text-gray-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-8">
            <button className="bg-purple-500 text-white py-2 px-8 rounded-full font-medium text-sm hover:opacity-80 transition-all">
              Create
            </button>
            <div className="w-[2.7rem] aspect-square rounded-full overflow-hidden">
              <img
                src={
                  authUser?.profilePic || "/placeholder.svg?height=50&width=50"
                }
                alt="Profile"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="relative top-[5.4rem]">
        <div className="w-[80%] mx-auto grid grid-cols-[18vw_auto_20vw] gap-8 relative max-lg:grid-cols-[5rem_auto_30vw] max-md:grid-cols-[0_auto_5rem]">
          {/* LEFT SIDEBAR */}
          <div className="h-max sticky top-[5.4rem] max-md:fixed max-md:bottom-0 max-md:right-0 max-md:top-auto z-5">
            <div className="p-4 bg-white rounded-lg flex items-center gap-4 max-lg:hidden">
              <div className="w-[2.7rem] aspect-square rounded-full overflow-hidden">
                <img
                  src={
                    authUser?.profilePic ||
                    "/placeholder.svg?height=50&width=50"
                  }
                  alt="Profile"
                  className="w-full"
                />
              </div>
              <div>
                <h4 className="font-medium">{authUser?.fullName || "User"}</h4>
                <p className="text-gray-500 text-sm">
                  @{authUser?.email?.split("@")[0] || "user"}
                </p>
              </div>
            </div>
            {/* SIDEBAR MENU */}
            <div className="mt-4 bg-white rounded-lg">
              <a className="flex items-center h-14 cursor-pointer transition-all relative hover:bg-gray-100 bg-gray-100 rounded-tl-lg overflow-hidden">
                <span className="before:content-[''] before:block before:w-2 before:h-full before:absolute before:bg-purple-500">
                  <Home className="text-purple-500 text-[1.4rem] ml-4 relative" />
                </span>
                <h3 className="ml-4 text-purple-500 max-lg:hidden">Home</h3>
              </a>
              <a className="flex items-center h-14 cursor-pointer transition-all relative hover:bg-gray-100">
                <span>
                  <Compass className="text-gray-500 text-[1.4rem] ml-4 relative" />
                </span>
                <h3 className="ml-4 max-lg:hidden">Explore</h3>
              </a>
              <a
                className="flex items-center h-14 cursor-pointer transition-all relative hover:bg-gray-100"
                id="notifications"
              >
                <span className="relative">
                  <Bell className="text-gray-500 text-[1.4rem] ml-4 relative" />
                  <small className="bg-red-500 text-white text-[0.7rem] w-fit rounded-full px-1.5 py-0.5 absolute -top-1 -right-1">
                    9+
                  </small>
                </span>
                <h3 className="ml-4 max-lg:hidden">Notifications</h3>
                {/* Popup thông báo (ẩn mặc định) */}
                <div className="absolute top-0 left-[110%] w-[30rem] bg-white rounded-lg p-4 shadow-lg z-8 hidden max-md:left-[-20rem] max-md:w-[20rem]">
                  {[1, 2, 3, 4, 5].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 mb-4">
                      <div className="w-[2.7rem] aspect-square rounded-full overflow-hidden">
                        <img
                          src={`/placeholder.svg?height=50&width=50&text=${item}`}
                          alt="Profile"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <b>KeKe Benjamin</b> accepted your friend request
                        <small className="text-gray-500 block">
                          2 DAYS AGO
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </a>

              <Link
                to="/message"
                className="flex items-center h-14 cursor-pointer transition-all relative hover:bg-gray-100"
              >
                <span className="relative">
                  <MessageSquare className="text-gray-500 text-[1.4rem] ml-4 relative" />
                  <small className="bg-red-500 text-white text-[0.7rem] w-fit rounded-full px-1.5 py-0.5 absolute -top-1 -right-1">
                    6
                  </small>
                </span>
                <h3 className="ml-4 max-lg:hidden">Message</h3>
              </Link>

              <a className="flex items-center h-14 cursor-pointer transition-all relative hover:bg-gray-100">
                <span>
                  <Bookmark className="text-gray-500 text-[1.4rem] ml-4 relative" />
                </span>
                <h3 className="ml-4 max-lg:hidden">Bookmarks</h3>
              </a>

              <a className="flex items-center h-14 cursor-pointer transition-all relative hover:bg-gray-100">
                <span>
                  <ChartLine className="text-gray-500 text-[1.4rem] ml-4 relative" />
                </span>
                <h3 className="ml-4 max-lg:hidden">Analytics</h3>
              </a>

              <a
                className="flex items-center h-14 cursor-pointer transition-all relative hover:bg-gray-100"
                id="theme"
              >
                <span>
                  <Palette className="text-gray-500 text-[1.4rem] ml-4 relative" />
                </span>
                <h3 className="ml-4 max-lg:hidden">Themes</h3>
              </a>

              <a className="flex items-center h-14 cursor-pointer transition-all relative hover:bg-gray-100 rounded-bl-lg overflow-hidden">
                <span>
                  <Settings className="text-gray-500 text-[1.4rem] ml-4 relative" />
                </span>
                <h3 className="ml-4 max-lg:hidden">Settings</h3>
              </a>
            </div>

            <button className="bg-purple-500 text-white py-4 px-8 rounded-full font-medium text-sm hover:opacity-80 transition-all w-full text-center mt-4 max-lg:hidden">
              Create Post
            </button>
          </div>

          {/* MIDDLE CONTENT */}
          <div className="max-md:col-span-2 max-md:col-start-1">
            {/* STORIES */}
            <div className="flex justify-between h-48 gap-2">
              {[1, 2, 3, 4, 5, 6].map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg flex flex-col justify-between items-center text-white text-xs w-full relative overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('/placeholder.svg?height=200&width=150&text=Story ${item}')`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent h-20 bottom-0 w-full"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-purple-500 self-start z-10">
                    <img
                      src={`/placeholder.svg?height=30&width=30&text=${item}`}
                      alt="Profile"
                      className="w-full rounded-full"
                    />
                  </div>
                  <p className="z-10">
                    {index === 0 ? "Your story" : `Story ${item}`}
                  </p>
                </div>
              ))}
            </div>

            {/* CREATE POST */}
            <form onSubmit={handleCreatePost} className="mt-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-[2.7rem] aspect-square rounded-full overflow-hidden">
                    <img
                      src={authUser?.profilePic || "/placeholder.svg?height=50&width=50"}
                      alt="Profile"
                      className="w-full"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="What's on your mind?"
                    className="w-full p-2 rounded-full bg-gray-100 focus:outline-none text-gray-800"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                  />
                </div>
              </div>
              
              {imagePreview && (
                <div className="mt-3 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-60 rounded-lg object-contain mx-auto"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              <div className="mt-3 flex justify-between items-center">
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-500 transition-colors"
                  >
                    <ImageIcon size={20} />
                    <span className="text-sm">Photo</span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="bg-purple-500 text-white py-2 px-6 rounded-full font-medium text-sm hover:opacity-80 transition-all disabled:opacity-50"
                  disabled={isCreatingPost || (!postText.trim() && !postImage)}
                >
                  {isCreatingPost ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Posting...</span>
                    </div>
                  ) : (
                    "Post"
                  )}
                </button>
              </div>
            </form>

            {/* FEEDS */}
            <div className="mt-4 space-y-4">
              {isLoading && posts.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <div key={post._id} className="bg-white rounded-lg p-4 text-sm">
                      {/* Post header */}
                      <div className="flex justify-between">
                        <div className="flex gap-4">
                          <div className="w-[2.7rem] aspect-square rounded-full overflow-hidden">
                            <img
                              src={post.userId?.profilePic || "/placeholder.svg?height=50&width=50"}
                              alt="Profile"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{post.userId?.fullName}</h3>
                            <small className="text-gray-500">{formatDate(post.createdAt)}</small>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {post.userId?._id === authUser?._id && (
                            <button 
                              onClick={() => handleDeletePost(post._id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                          <span>
                            <EllipsisHorizontal className="w-5 h-5 cursor-pointer" />
                          </span>
                        </div>
                      </div>

                      {/* Post content */}
                      {post.text && (
                        <div className="my-3">
                          <p>{post.text}</p>
                        </div>
                      )}
                      
                      {/* Post image */}
                      {post.image && (
                        <div className="rounded-lg overflow-hidden my-3">
                          <img
                            src={post.image}
                            alt="Post content"
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex justify-between items-center text-xl my-2">
                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleLikePost(post._id)}
                            className={`cursor-pointer ${hasLikedPost(post) ? 'text-purple-500' : 'text-gray-500'}`}
                          >
                            <ThumbsUp className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => toggleCommentInput(post._id)}
                            className="cursor-pointer text-gray-500 hover:text-purple-500"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Likes */}
                      <div className="flex items-center">
                        {post.likes?.length > 0 && (
                          <>
                            <div className="flex">
                              <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white">
                                <img
                                  src="/placeholder.svg?height=30&width=30"
                                  alt="Profile"
                                  className="w-full"
                                />
                              </div>
                            </div>
                            <p className="ml-2">
                              {post.likes?.length} {post.likes?.length === 1 ? 'person' : 'people'} liked this
                            </p>
                          </>
                        )}
                      </div>

                      {/* Comments */}
                      {post.comments?.length > 0 && (
                        <div className="mt-2">
                          <p 
                            className="text-gray-500 cursor-pointer hover:text-purple-500"
                          >
                            View all {post.comments.length} comments
                          </p>
                          
                          {/* Show the latest comment */}
                          {post.comments.length > 0 && (
                            <div className="mt-2 bg-gray-50 p-2 rounded-lg">
                              <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                  <img
                                    src={post.comments[post.comments.length - 1]?.userId?.profilePic || "/placeholder.svg?height=30&width=30"}
                                    alt="Profile"
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <p>
                                    <span className="font-semibold">{post.comments[post.comments.length - 1]?.userId?.fullName}</span>
                                    <span className="ml-2">{post.comments[post.comments.length - 1]?.text}</span>
                                  </p>
                                  <small className="text-gray-500">{formatDate(post.comments[post.comments.length - 1]?.createdAt)}</small>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Comment input */}
                      {showCommentInput[post._id] && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src={authUser?.profilePic || "/placeholder.svg?height=40&width=40"}
                              alt="Profile"
                              className="w-full"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            className="flex-grow bg-gray-100 rounded-full py-2 px-4 focus:outline-none text-sm"
                            value={commentText[post._id] || ''}
                            onChange={(e) => setCommentText({...commentText, [post._id]: e.target.value})}
                          />
                          <button 
                            onClick={() => handleAddComment(post._id)}
                            className="bg-purple-500 text-white rounded-full p-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Load more button */}
                  {pagination.currentPage < pagination.totalPages && (
                    <div className="flex justify-center py-4">
                      <button 
                        onClick={handleLoadMorePosts}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-6 rounded-full font-medium text-sm transition-all disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          "Load More"
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="h-max sticky top-[var(--sticky-top-right)] bottom-0 max-md:hidden">
            {/* MESSAGES */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Messages</h4>
                <Edit className="text-xl cursor-pointer" />
              </div>

              <div className="flex bg-gray-100 rounded-full py-2 px-4 mb-4">
                <Search className="text-gray-500" />
                <input
                  type="search"
                  placeholder="Search messages"
                  className="bg-transparent w-full ml-2 focus:outline-none text-sm"
                />
              </div>

              {/* MESSAGE CATEGORY */}
              <div className="flex justify-between mb-4">
                <h6 className="w-full text-center pb-2 border-b-4 border-gray-800 text-sm font-semibold">
                  Primary
                </h6>
                <h6 className="w-full text-center pb-2 border-b-4 border-gray-100 text-sm font-semibold">
                  General
                </h6>
                <h6 className="w-full text-center pb-2 border-b-4 border-gray-100 text-sm font-semibold text-purple-500">
                  Requests(7)
                </h6>
              </div>

              {/* Danh sách tin nhắn */}
              {isUsersLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="flex gap-4 mb-4 cursor-pointer"
                    onClick={() => handleMessageClick(user)}
                  >
                    <div className="relative">
                      <div className="w-[2.7rem] aspect-square rounded-full overflow-hidden">
                        <img
                          src={
                            user.profilePic ||
                            "/placeholder.svg?height=50&width=50"
                          }
                          alt="Profile"
                          className="w-full rounded-full"
                        />
                      </div>
                      {isUserOnline(user._id) && (
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500 absolute bottom-0 right-0"></div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium">{user.fullName}</h5>
                      <p className="text-sm text-gray-500">
                        {isUserOnline(user._id) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">No users found</div>
              )}
            </div>

            {/* FRIEND REQUESTS */}
            <div className="mt-4">
              <h4 className="text-gray-500 font-medium my-4">Requests</h4>
              {[1, 2, 3].map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg mb-3">
                  <div className="flex gap-4 mb-4">
                    <div className="w-[2.7rem] aspect-square rounded-full overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=50&width=50&text=${item}`}
                        alt="Profile"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <h5 className="font-medium">Hajia Bintu</h5>
                      <p className="text-gray-500 text-sm">8 mutual friends</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="bg-purple-500 text-white py-2 px-4 rounded-full text-sm font-medium hover:opacity-80 transition-all">
                      Accept
                    </button>
                    <button className="bg-white border border-gray-200 py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-100 transition-all">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* POPUP MODAL CHAT */}
      {showMessagePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg h-[90vh] max-h-[700px] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Chat with{" "}
                {useChatStore.getState().selectedUser?.fullName || "User"}
                {isUserOnline(useChatStore.getState().selectedUser?._id) && (
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                )}
              </h2>
              <button
                onClick={() => setShowMessagePopup(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatContainer />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialHome;
