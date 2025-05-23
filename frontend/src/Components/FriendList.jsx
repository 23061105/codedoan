import { useEffect } from 'react';
import { useFriendStore } from '../store/useFriendStore';
import { useAuthStore } from '../store/useAuthStore';
import { UserPlus, Check, X, UserMinus, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * FriendList Component
 * 
 * This component manages the display of:
 * 1. User's current friends list
 * 2. Incoming friend requests that need response
 * 3. Outgoing friend requests that are pending
 * 
 * Features:
 * - Real-time updating of friends and requests via the useFriendStore
 * - Online status indicators for friends
 * - Accept/decline actions for incoming requests
 * - Friend removal functionality
 */
const FriendList = () => {
  const { 
    friends, 
    friendRequests, 
    sentRequests,
    fetchFriends, 
    fetchFriendRequests, 
    fetchSentRequests,
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    loading   } = useFriendStore();
  
  const { onlineUsers, socket } = useAuthStore();

  // Fetch all friend data when component mounts
  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    fetchSentRequests();
  }, [fetchFriends, fetchFriendRequests, fetchSentRequests]);
  
  // Listen for socket events related to friend requests
  useEffect(() => {
    if (socket) {
      const handleFriendRequest = () => {
        fetchFriendRequests();
      };
      
      const handleFriendAccepted = () => {
        fetchFriends();
        fetchSentRequests();
      };
      
      const handleFriendRemoved = () => {
        fetchFriends();
      };
      
      socket.on("friendRequest", handleFriendRequest);
      socket.on("friendAccepted", handleFriendAccepted);
      socket.on("friendRemoved", handleFriendRemoved);
      
      return () => {
        socket.off("friendRequest", handleFriendRequest);
        socket.off("friendAccepted", handleFriendAccepted);
        socket.off("friendRemoved", handleFriendRemoved);
      };
    }
  }, [socket, fetchFriendRequests, fetchFriends, fetchSentRequests]);

  /**
   * Checks if a user is currently online by looking at the onlineUsers array
   * @param {string} userId - The ID of the user to check
   * @returns {boolean} True if the user is online
   */
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  /**
   * Handles sending a friend request to a user
   * @param {string} userId - ID of the user to send the request to
   */
  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
    } catch (error) {
      toast.error('Error sending friend request');
    }
  };

  /**
   * Handles accepting an incoming friend request
   * @param {string} requestId - ID of the friend request to accept
   */
  const handleAcceptRequest = async (requestId) => {
    try {
      await respondToFriendRequest(requestId, true);
    } catch (error) {
      toast.error('Error accepting friend request');
    }
  };

  /**
   * Handles declining an incoming friend request
   * @param {string} requestId - ID of the friend request to decline
   */
  const handleDeclineRequest = async (requestId) => {
    try {
      await respondToFriendRequest(requestId, false);
    } catch (error) {
      toast.error('Error declining friend request');
    }
  };

  /**
   * Handles removing a friend from the user's friend list
   * Displays a confirmation dialog before proceeding
   * @param {string} friendId - ID of the friend to remove
   */
  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      try {
        await removeFriend(friendId);
      } catch (error) {
        toast.error('Error removing friend');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Friends List Section */}
      <div className="bg-base-100 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends ({friends.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading friends...</div>
        ) : friends.length > 0 ? (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div key={friend._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                  <div>
                    <h3 className="font-medium">{friend.fullName}</h3>
                    <p className="text-xs text-gray-500">
                      {isUserOnline(friend._id) ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend._id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                  title="Remove friend"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            You don't have any friends yet.
          </div>
        )}
      </div>

      {/* Friend Requests Section */}
      <div className="bg-base-100 rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-bold mb-4">Friend Requests ({friendRequests.length})</h2>
        
        {loading ? (
          <div className="text-center py-4">Loading requests...</div>
        ) : friendRequests.length > 0 ? (
          <div className="space-y-4">
            {friendRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={request.from.profilePic || "/avatar.png"}
                    alt={request.from.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{request.from.fullName}</h3>
                    <p className="text-xs text-gray-500">{request.from.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request._id)}
                    className="bg-primary text-white rounded-full p-2"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request._id)}
                    className="bg-gray-200 text-gray-700 rounded-full p-2"
                    title="Decline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No pending friend requests.
          </div>
        )}
      </div>

      {/* Sent Requests Section */}
      <div className="bg-base-100 rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-bold mb-4">Sent Requests ({sentRequests.length})</h2>
        
        {loading ? (
          <div className="text-center py-4">Loading sent requests...</div>
        ) : sentRequests.length > 0 ? (
          <div className="space-y-4">
            {sentRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={request.to.profilePic || "/avatar.png"}
                    alt={request.to.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{request.to.fullName}</h3>
                    <p className="text-xs text-gray-500">{request.to.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 italic">Pending</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No pending sent requests.
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendList;
