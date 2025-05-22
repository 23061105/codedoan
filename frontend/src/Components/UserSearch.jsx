import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search, UserPlus, MessageSquare, Check } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * UserSearch Component
 *
 * This component allows users to search for other users in the system and:
 * 1. Send friend requests to users they're not already friends with
 * 2. See the current status of their relationship with each user
 * 3. Start conversations with users
 *
 * It integrates with the friend system and shows different UI elements
 * depending on whether a user is a friend, has a pending request,
 * or has no relationship with the current user.
 */
const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { users } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const { friends, sentRequests, sendFriendRequest } = useFriendStore();

  /**
   * Handles search input changes and filters users based on the query
   * Searches both user names and email addresses
   * @param {Event} e - The input change event
   */
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Filter users based on search query
    const filteredUsers = users.filter(
      (user) =>
        user._id !== authUser._id && // Don't include current user
        (user.fullName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()))
    );

    setSearchResults(filteredUsers);
    setIsSearching(false);
  };

  /**
   * Checks if the specified user is already a friend of the current user
   * @param {string} userId - ID of the user to check
   * @returns {boolean} True if the user is a friend
   */
  const isUserFriend = (userId) => {
    return friends.some((friend) => friend._id === userId);
  };

  /**
   * Checks if the current user has already sent a friend request to this user
   * @param {string} userId - ID of the user to check
   * @returns {boolean} True if a request is pending
   */
  const hasPendingRequest = (userId) => {
    return sentRequests.some((request) => request.to?._id === userId);
  };

  /**
   * Checks if a user is currently online
   * @param {string} userId - ID of the user to check
   * @returns {boolean} True if the user is online
   */
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  /**
   * Handles sending a friend request to another user
   * Shows error toast if the user ID is invalid
   * @param {string} userId - ID of the user to send request to
   */
  const handleSendFriendRequest = async (userId) => {
    try {
      if (!userId) {
        toast.error("Invalid user ID");
        return;
      }

      await sendFriendRequest(userId);
      // Toast is already shown in the store function
    } catch (error) {
      console.error("Error in handleSendFriendRequest:", error);
      toast.error(error.message || "Failed to send friend request");
    }
  };

  // Handle starting a conversation with a user
  const handleStartConversation = (user) => {
    useChatStore.getState().setSelectedUser(user);
    toast.success(`Starting conversation with ${user.fullName}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-bold mb-4">Find People</h2>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name or email"
          className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {isSearching && (
        <div className="text-center py-4">
          <span className="loading loading-spinner text-purple-500"></span>
        </div>
      )}

      {searchResults.length > 0 ? (
        <div className="mt-4 space-y-4">
          {searchResults.map((user) => (
            <div key={user._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {isUserOnline(user._id) && (
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500 absolute bottom-0 right-0"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{user.fullName}</h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStartConversation(user)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  title="Start conversation"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                {isUserFriend(user._id) ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Friends
                  </span>
                ) : hasPendingRequest(user._id) ? (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    Request Sent
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendFriendRequest(user._id)}
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-full"
                    title="Add friend"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : searchQuery && !isSearching ? (
        <div className="text-center py-4 text-gray-500">
          No users found matching "{searchQuery}"
        </div>
      ) : null}
    </div>
  );
};

export default UserSearch;
