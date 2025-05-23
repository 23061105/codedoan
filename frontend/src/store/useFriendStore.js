import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFriendStore = create((set, get) => ({
  friends: [],
  requests: [],
  sentRequests: [],
  isLoadingFriends: false,
  isLoadingRequests: false,
  isLoadingSent: false,

  fetchFriends: async () => {
    set({ isLoadingFriends: true });
    try {
      const res = await axiosInstance.get("/friends/me");
      set({ friends: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load friends");
    } finally {
      set({ isLoadingFriends: false });
    }
  },

  fetchRequests: async () => {
    set({ isLoadingRequests: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ requests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load friend requests");
    } finally {
      set({ isLoadingRequests: false });
    }
  },

  fetchSentRequests: async () => {
    set({ isLoadingSent: true });
    try {
      const res = await axiosInstance.get("/friends/sent");
      set({ sentRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load sent requests");
    } finally {
      set({ isLoadingSent: false });
    }
  },
  sendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/${userId}/request`);
      toast.success("Friend request sent");
      // Update only the sent requests since the receiver will be notified via socket
      get().fetchSentRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  },
  acceptRequest: async (userId) => {
    try {
      await axiosInstance.put(`/friends/${userId}/accept`);
      toast.success("Friend request accepted");
      // Refresh both friends list and incoming requests - the other user will be updated via socket
      get().fetchFriends();
      get().fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  declineRequest: async (userId) => {
    try {
      await axiosInstance.put(`/friends/${userId}/decline`);
      toast.success("Friend request declined");
      // Refresh incoming requests
      get().fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline request");
    }
  },
  removeFriend: async (userId) => {
    try {
      await axiosInstance.delete(`/friends/${userId}/unfriend`);
      toast.success("Friend removed successfully");
      // Refresh friends list - the other user will be updated via socket
      get().fetchFriends();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    }
  },  cancelRequest: async (userId) => {
    try {
      // Optimistically update the UI by removing the cancelled request from sentRequests
      set((state) => ({
        sentRequests: state.sentRequests.filter(request => request._id !== userId)
      }));
      
      // We use the decline endpoint for cancellation too since
      // it's the same operation from a database perspective
      await axiosInstance.put(`/friends/${userId}/decline`);
      
      toast.success("Friend request cancelled");
      
      // Always fetch again to ensure server state is properly synchronized
      get().fetchSentRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel request");
      // Re-fetch in case of error to restore the correct state
      get().fetchSentRequests();
    }
  },
  // Handle new friend request received via socket
  handleNewFriendRequest: (request) => {
    // Immediately fetch requests to update UI with the new request
    get().fetchRequests();
    
    // You could also optimistically update the local state if you have the complete request data
    // but fetching ensures we have the most accurate data
  },

  // Handle when someone accepts your friend request
  handleFriendRequestAccepted: (user) => {
    // Update friends and sent requests lists
    get().fetchFriends();
    get().fetchSentRequests();
  },

  // Handle when someone removes you as a friend
  handleFriendRemoved: (data) => {
    // Update friends list
    get().fetchFriends();
  },
}));
