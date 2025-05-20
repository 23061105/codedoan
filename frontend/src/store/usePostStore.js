import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const usePostStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  isCreatingPost: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
  },

  // Get posts with pagination
  getPosts: async (page = 1, limit = 10) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/posts?page=${page}&limit=${limit}`);
      set({
        posts: res.data.posts,
        pagination: {
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalPosts: res.data.totalPosts,
        },
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new post
  createPost: async (postData) => {
    set({ isCreatingPost: true });
    try {
      const res = await axiosInstance.post("/posts/create", postData);
      set((state) => ({
        posts: [res.data, ...state.posts],
        pagination: {
          ...state.pagination,
          totalPosts: state.pagination.totalPosts + 1,
        },
      }));
      toast.success("Post created successfully");
      return res.data;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
      return null;
    } finally {
      set({ isCreatingPost: false });
    }
  },

  // Like or unlike a post
  likePost: async (postId) => {
    try {
      const res = await axiosInstance.put(`/posts/like/${postId}`);
      const authUser = useAuthStore.getState().authUser;

      // Update post in state
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: res.data.liked
                  ? [...post.likes, authUser?._id]
                  : post.likes.filter((id) => id !== authUser?._id),
              }
            : post
        ),
      }));

      return res.data;
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  },

  // Add a comment to a post
  addComment: async (postId, text) => {
    try {
      const res = await axiosInstance.post(`/posts/comment/${postId}`, {
        text,
      });

      // Update post in state
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, res.data] }
            : post
        ),
      }));

      return res.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  },

  // Delete a post
  deletePost: async (postId) => {
    console.log(`/posts/${postId}`);
    try {
      await axiosInstance.delete(`/posts/${postId}`);

      // Remove post from state
      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
        pagination: {
          ...state.pagination,
          totalPosts: state.pagination.totalPosts - 1,
        },
      }));

      toast.success("Post deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
      return false;
    }
  },

  // Load more posts (pagination)
  loadMorePosts: async () => {
    const { pagination } = get();
    if (pagination.currentPage >= pagination.totalPages) return;

    const nextPage = pagination.currentPage + 1;
    set({ isLoading: true });

    try {
      const res = await axiosInstance.get(`/posts?page=${nextPage}&limit=10`);
      set((state) => ({
        posts: [...state.posts, ...res.data.posts],
        pagination: {
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalPosts: res.data.totalPosts,
        },
      }));
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast.error("Failed to load more posts");
    } finally {
      set({ isLoading: false });
    }
  },

  // Reset post state
  resetPosts: () => {
    set({
      posts: [],
      isLoading: false,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
      },
    });
  },
}));
