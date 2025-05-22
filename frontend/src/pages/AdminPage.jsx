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

const AdminPage = () => {
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
    pagination,
  } = usePostStore();

  // State for post creation
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showAllComments, setShowAllComments] = useState({});
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
      image: postImage,
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
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
    setShowCommentInput((prev) => ({ ...prev, [postId]: false }));
  };

  // Handle deleting a post
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId);
    }
  };

  // Handle showing/hiding comment input
  const toggleCommentInput = (postId) => {
    setShowCommentInput((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Handle showing/hiding all comments
  const toggleAllComments = (postId) => {
    setShowAllComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
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
    return post.likes?.some((like) => like === authUser?._id);
  };

  // Load more posts when user scrolls to bottom
  const handleLoadMorePosts = () => {
    if (pagination.currentPage < pagination.totalPages && !isLoading) {
      loadMorePosts();
    }
  };

  return (
    <>
      <div className="relative top-[5.4rem]">
        <div className="p-8 grid grid-cols-5 gap-4 justify-center">
          <div className="shadow-md col-span-3">
            <div>Users</div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-4"></div>
              {isUsersLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="flex gap-4 mb-4 cursor-pointer"
                    // onClick={() => handleMessageClick(user)}
                  >
                    <div className="relative">
                      <div className="w-[2.7rem] aspect-square rounded-full overflow-hidden">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
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
          </div>
          <div className="shadow-md col-span-2">
            <div className="max-md:col-span-2 max-md:col-start-1">
              <div>User post</div>
              {/* FEEDS */}
              <div
                className="h-114 mt-4 space-y-4 overflow-y-scroll "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {isLoading && posts.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-gray-500">
                      No posts yet. Be the first to share something!
                    </p>
                  </div>
                ) : (
                  <>
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="bg-white rounded-lg p-4 text-sm shadow-md"
                      >
                        {/* Post header */}
                        <div className="flex justify-between">
                          <div className="flex gap-4">
                            <div className="w-[2.7rem] aspect-square rounded-full overflow-hidden">
                              <img
                                src={post.userId?.profilePic || "/avatar.png"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-base-content">
                                {post.userId?.fullName}
                              </h3>
                              <small className="text-gray-500">
                                {formatDate(post.createdAt)}
                              </small>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {(post.userId?._id === authUser?._id ||
                              authUser?.role === "admin") && (
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
                              className={`cursor-pointer ${
                                hasLikedPost(post)
                                  ? "text-purple-500"
                                  : "text-gray-500"
                              }`}
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
                                    src={authUser?.profilePic || "/avatar.png"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <p className="ml-2">
                                {post.likes?.length}{" "}
                                {post.likes?.length === 1 ? "person" : "people"}{" "}
                                liked this
                              </p>
                            </>
                          )}
                        </div>

                        {/* Comments */}
                        {post.comments?.length > 0 && (
                          <div className="mt-2">
                            <p
                              className="text-gray-500 cursor-pointer hover:text-purple-500"
                              onClick={() => toggleAllComments(post._id)}
                            >
                              {showAllComments[post._id]
                                ? "Hide comments"
                                : `View all ${post.comments.length} comments`}
                            </p>

                            {showAllComments[post._id] ? (
                              // Show all comments when expanded
                              <div className="mt-2 space-y-2">
                                {post.comments.map((comment, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-2 rounded-lg"
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                        <img
                                          src={
                                            comment.userId?.profilePic ||
                                            "/avatar.png"
                                          }
                                          alt="Profile"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div>
                                        <p>
                                          <span className="font-semibold">
                                            {comment.userId?.fullName}
                                          </span>
                                          <span className="ml-2">
                                            {comment.text}
                                          </span>
                                        </p>
                                        <small className="text-gray-500">
                                          {formatDate(comment.createdAt)}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // Show only the latest comment when not expanded
                              <div className="mt-2 bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                    <img
                                      src={
                                        post.comments[post.comments.length - 1]
                                          ?.userId?.profilePic || "/avatar.png"
                                      }
                                      alt="Profile"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p>
                                      <span className="font-semibold">
                                        {
                                          post.comments[
                                            post.comments.length - 1
                                          ]?.userId?.fullName
                                        }
                                      </span>
                                      <span className="ml-2">
                                        {
                                          post.comments[
                                            post.comments.length - 1
                                          ]?.text
                                        }
                                      </span>
                                    </p>
                                    <small className="text-gray-500">
                                      {formatDate(
                                        post.comments[post.comments.length - 1]
                                          ?.createdAt
                                      )}
                                    </small>
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
                                src={authUser?.profilePic || "/avatar.png"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              className="flex-grow bg-gray-100 rounded-full py-2 px-4 focus:outline-none text-sm"
                              value={commentText[post._id] || ""}
                              onChange={(e) =>
                                setCommentText({
                                  ...commentText,
                                  [post._id]: e.target.value,
                                })
                              }
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
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
