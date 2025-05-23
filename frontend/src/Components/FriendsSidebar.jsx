import { useEffect } from 'react';
import { useFriendStore } from '../store/useFriendStore';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { Users } from 'lucide-react';

/**
 * FriendsSidebar Component
 * 
 * This component displays a compact sidebar showing the user's friends list.
 * It is primarily used in the chat interface to easily start conversations.
 * 
 * Features:
 * - Shows online status indicators for each friend
 * - Clicking on a friend starts a chat conversation with them
 * - Automatically updates when friend list changes
 * 
 * @param {function} onStartChat - Optional callback for when a friend is selected
 */
const FriendsSidebar = ({ onStartChat }) => {
  const { friends, fetchFriends, loading } = useFriendStore();
  const { onlineUsers, socket } = useAuthStore();
  
  // Fetch friends data when component mounts
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);
  
  // Listen for socket events to update friends list in real-time
  useEffect(() => {
    if (socket) {
      const handleFriendAccepted = () => {
        fetchFriends();
      };
      
      const handleFriendRemoved = () => {
        fetchFriends();
      };
      
      socket.on("friendAccepted", handleFriendAccepted);
      socket.on("friendRemoved", handleFriendRemoved);
      
      return () => {
        socket.off("friendAccepted", handleFriendAccepted);
        socket.off("friendRemoved", handleFriendRemoved);
      };
    }
  }, [socket, fetchFriends]);
  
  /**
   * Checks if a user is currently online
   * @param {string} userId - ID of the user to check
   * @returns {boolean} True if the user is online
   */
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };
  
  /**
   * Handles clicking on a friend to start a conversation
   * Sets the selected user in the chat store and calls the optional callback
   * @param {object} friend - The friend object to start a chat with
   */
  const handleFriendClick = (friend) => {
    useChatStore.getState().setSelectedUser(friend);
    if (onStartChat) {
      onStartChat(friend);
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-4 mb-4">
      {/* Header section with friend count */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Friends ({friends.length})
        </h4>
      </div>
      
      {/* Conditional rendering based on loading state and friends availability */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : friends.length > 0 ? (
        <div className="space-y-3">
          {/* Map through each friend and display with online status */}
          {friends.map(friend => (
            <div 
              key={friend._id}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => handleFriendClick(friend)}
            >
              {/* Friend avatar with online status indicator */}
              <div className="relative">
                <img
                  src={friend.profilePic || "/avatar.png"}
                  alt={friend.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {isUserOnline(friend._id) && (
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500 absolute bottom-0 right-0"></div>
                )}
              </div>
              {/* Friend name and online status text */}
              <div>
                <h5 className="font-medium text-sm">{friend.fullName}</h5>
                <p className="text-xs text-gray-500">
                  {isUserOnline(friend._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No friends yet
        </div>
      )}
    </div>
  );
};

export default FriendsSidebar;
