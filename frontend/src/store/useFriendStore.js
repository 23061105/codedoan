/**
 * Friend Management Store
 * 
 * This Zustand store manages all friend-related functionality:
 * - Maintaining lists of friends, incoming requests, and sent requests
 * - Providing API calls for all friend operations (send/accept/decline requests, remove friends)
 * - Handling real-time friend request notifications via Socket.IO
 * 
 * The store serves as a central state manager for friend data across the application
 * and handles both API data fetching and real-time updates.
 */
import { create } from 'zustand';
import { axiosInstance as axios } from '../lib/axios';
import { toast } from 'react-hot-toast';

const useFriendStore = create((set, get) => ({  /**
   * State properties:
   * - friends: Array of users who are friends with the current user
   * - friendRequests: Array of pending friend requests sent to the current user
   * - sentRequests: Array of pending friend requests sent by the current user
   * - loading: Boolean flag to track API request status
   */
  friends: [],
  friendRequests: [],
  sentRequests: [],
  loading: false,
  
  /**
   * Fetches the current user's friend list from the API
   * Updates the 'friends' state property with the response data
   * @returns {Array} Array of friend objects
   */
  fetchFriends: async () => {
    try {
      set({ loading: true });
      const { data } = await axios.get('/friends/list');
      set({ friends: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Error fetching friends');
      console.error("Error fetching friends:", error);
      return [];
    }
  },
    /**
   * Fetches all pending friend requests sent to the current user
   * Updates the 'friendRequests' state with incoming friend requests
   * @returns {Array} Array of request objects with sender details
   */
  fetchFriendRequests: async () => {
    try {
      set({ loading: true });
      const { data } = await axios.get('/friends/requests');
      set({ friendRequests: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Error fetching friend requests');
      console.error("Error fetching friend requests:", error);
      return [];
    }
  },
    /**
   * Fetches all pending friend requests sent by the current user
   * Updates the 'sentRequests' state with outgoing friend requests
   * @returns {Array} Array of request objects with recipient details
   */
  fetchSentRequests: async () => {
    try {
      set({ loading: true });
      const { data } = await axios.get('/friends/sent');
      set({ sentRequests: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Error fetching sent requests');
      console.error("Error fetching sent requests:", error);
      return [];
    }
  },  /**
   * Sends a friend request to another user
   * After successful API call, refreshes the sent requests list
   * 
   * @param {string} toUserId - The ID of the user to send the request to
   * @returns {object|null} The created friend request object or null if error
   */
  sendFriendRequest: async (toUserId) => {
    try {
      set({ loading: true });
      
      if (!toUserId) {
        throw new Error('User ID is required');
      }
      
      // Send request to the backend API with the recipient's user ID
      const { data } = await axios.post('/friends/send', { toUserId });
      
      // Refresh sent requests
      get().fetchSentRequests();
      
      set({ loading: false });
      toast.success('Friend request sent!');
      return data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Error sending friend request');
      console.error("Error sending friend request:", error);
      return null;
    }
  },
    /**
   * Responds to an incoming friend request (accept or decline)
   * After response, refreshes both the friend requests and friends lists
   * 
   * @param {string} requestId - The ID of the friend request to respond to
   * @param {boolean} accept - Whether to accept (true) or decline (false) the request
   * @returns {object|null} Response data or null if error
   */
  respondToFriendRequest: async (requestId, accept) => {
    try {
      set({ loading: true });
      const { data } = await axios.post('/friends/respond', { requestId, accept });
      
      // Update the local state
      await Promise.all([
        get().fetchFriendRequests(),
        get().fetchFriends()
      ]);
      
      set({ loading: false });
      toast.success(`Friend request ${accept ? 'accepted' : 'declined'}`);
      return data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Error responding to request');
      console.error("Error responding to friend request:", error);
      return null;
    }
  },
    /**
   * Removes a user from the current user's friends list
   * Also updates the local friends state to reflect the removal immediately
   * 
   * @param {string} friendId - The ID of the friend to remove
   * @returns {object|null} Response data or null if error
   */
  removeFriend: async (friendId) => {
    try {
      set({ loading: true });
      const { data } = await axios.post('/friends/remove', { friendId });
      
      // Update friends list
      set(state => ({ 
        friends: state.friends.filter(friend => friend._id !== friendId),
        loading: false
      }));
      
      toast.success('Friend removed');
      return data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Error removing friend');
      console.error("Error removing friend:", error);
      return null;
    }
  },
    /**
   * Socket.io event handler for receiving new friend requests
   * Updates the friendRequests state and shows a notification
   * 
   * @param {object} request - The friend request object with sender details
   */
  handleNewFriendRequest: (request) => {
    // Add the new request to the existing requests array
    set(state => ({
      friendRequests: [...state.friendRequests, request]
    }));
    // Show a notification to the user
    toast.success(`New friend request from ${request.from.fullName}`);
  },
  
  /**
   * Socket.io event handler for when someone accepts your friend request
   * Refreshes the friends list and sent requests, displays notification
   * 
   * @param {object} data - Object containing user who accepted the request
   */
  handleFriendRequestAccepted: (data) => {
    // Update both the friends list and sent requests
    get().fetchFriends();
    get().fetchSentRequests();
    toast.success(`${data.user.fullName} accepted your friend request!`);
  },
  
  /**
   * Socket.io event handler for when someone removes you as a friend
   * Updates the friends list in real-time without page refresh
   * 
   * @param {object} data - Object containing ID of user who removed you
   */
  handleFriendRemoved: (data) => {
    const { userId } = data;
    // Filter out the user from friends list
    set(state => ({
      friends: state.friends.filter(friend => friend._id !== userId)
    }));
    toast.info(`A user has removed you from their friends list`);
  }
}));

export { useFriendStore };
export default useFriendStore;
