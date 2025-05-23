import { useState, useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { UserPlus, Check, X, MessageCircle, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";

function FriendsWidget({ searchQuery = "" }) {
  const { authUser, socket } = useAuthStore();
  const { users } = useChatStore();
  const {
    friends,
    requests,
    sentRequests,
    fetchFriends,
    fetchRequests,
    fetchSentRequests,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    cancelRequest
  } = useFriendStore();

  const [activeTab, setActiveTab] = useState("suggestions");

  useEffect(() => {
    if (authUser) {
      fetchFriends();
      fetchRequests();
      fetchSentRequests();
    }
  }, [authUser, fetchFriends, fetchRequests, fetchSentRequests]);
  
  // Listen for socket events to update the friends and requests lists in real-time
  useEffect(() => {
    if (socket) {
      const handleFriendRequest = () => {
        fetchRequests();
      };
      
      const handleFriendAccepted = () => {
        fetchFriends();
        fetchSentRequests();
      };
      
      const handleFriendRemoved = () => {
        fetchFriends();
      };
      
      const handleRequestCanceled = () => {
        fetchRequests();
      };
      
      socket.on("friendRequest", handleFriendRequest);
      socket.on("friendAccepted", handleFriendAccepted);
      socket.on("friendRemoved", handleFriendRemoved);
      socket.on("requestCanceled", handleRequestCanceled);
      
      return () => {
        socket.off("friendRequest", handleFriendRequest);
        socket.off("friendAccepted", handleFriendAccepted);
        socket.off("friendRemoved", handleFriendRemoved);
        socket.off("requestCanceled", handleRequestCanceled);
      };
    }
  }, [socket, fetchFriends, fetchRequests, fetchSentRequests]);

  // Filter out users who are already friends or have pending requests
  const suggestions = users.filter(user => {
    if (!authUser || user._id === authUser._id) return false;
    if (friends.some(f => f._id === user._id)) return false;
    if (requests.some(r => r._id === user._id)) return false;
    if (sentRequests.some(r => r._id === user._id)) return false;
    return true;
  });

  // Filter users based on search query
  const filteredSuggestions = suggestions.filter(user => 
    searchQuery ? 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : true
  );

  const filteredRequests = requests.filter(user => 
    searchQuery ? 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : true
  );

  const filteredSentRequests = sentRequests.filter(user => 
    searchQuery ? 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : true
  );

  const filteredFriends = friends.filter(user => 
    searchQuery ? 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : true
  );

  const renderTabContent = () => {
    switch (activeTab) {      case "suggestions":
        return (
          <div className="space-y-3 mt-3">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.slice(0, 5).map(user => (
                <div key={user._id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img 
                        src={user.profilePic || "/avatar.png"} 
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-800">{user.fullName}</span>
                      <span className="text-xs text-gray-600">@{user.email?.split("@")[0] || "user"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sendRequest(user._id);
                      // Re-fetch data after sending a request
                      setTimeout(() => {
                        fetchSentRequests();
                      }, 300);
                    }}
                    className="p-2 rounded-full hover:bg-gray-200 text-blue-600"
                    title="Send Friend Request"
                  >
                    <UserPlus size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-md">No suggestions available</p>
            )}
          </div>
        );
        case "requests":
        return (
          <div className="space-y-3 mt-3">
            {filteredRequests.length > 0 ? (
              filteredRequests.map(user => (
                <div key={user._id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img 
                        src={user.profilePic || "/avatar.png"} 
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-800">{user.fullName}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        acceptRequest(user._id);
                        // Re-fetch data after accepting a request
                        setTimeout(() => {
                          fetchFriends();
                          fetchRequests();
                        }, 300);
                      }}
                      className="p-2 text-green-600 rounded-full hover:bg-gray-200"
                      title="Accept"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => {
                        declineRequest(user._id);
                        // Re-fetch data after declining a request
                        setTimeout(() => {
                          fetchRequests();
                        }, 300);
                      }}
                      className="p-2 text-red-600 rounded-full hover:bg-gray-200"
                      title="Decline"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-md">No pending requests</p>
            )}
          </div>
        );
        case "sent":
        return (
          <div className="space-y-3 mt-3">
            {filteredSentRequests.length > 0 ? (
              filteredSentRequests.map(user => (
                <div key={user._id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img 
                        src={user.profilePic || "/avatar.png"} 
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-800">{user.fullName}</span>
                      <span className="text-xs text-gray-600">Request sent</span>
                    </div>
                  </div>                  <button
                    onClick={() => {
                      cancelRequest(user._id);
                      // No need for setTimeout, the store should handle updates
                    }}
                    className="p-2 rounded-full hover:bg-gray-200 text-red-600"
                    title="Cancel Request"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-md">No sent requests</p>
            )}
          </div>
        );        case "friends":
        return (
          <div className="space-y-3 mt-3">
            {filteredFriends.length > 0 ? (
              filteredFriends.map(user => (
                <div key={user._id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img 
                        src={user.profilePic || "/avatar.png"} 
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-800">{user.fullName}</span>
                      <span className="text-xs text-gray-600">@{user.email?.split("@")[0] || "user"}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        // Here you could open a message with this user
                        toast.success(`Chat with ${user.fullName}`);
                      }}
                      className="p-2 rounded-full hover:bg-gray-200 text-blue-600"
                      title="Message"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button
                      onClick={() => {
                        removeFriend(user._id);
                        // Re-fetch data after removing a friend
                        setTimeout(() => {
                          fetchFriends();
                          fetchRequests();
                          fetchSentRequests();
                        }, 300);
                      }}
                      className="p-2 text-red-600 rounded-full hover:bg-gray-200"
                      title="Unfriend"
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-md">No friends yet</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <h3 className="text-base font-medium text-gray-800">Friends</h3>
        <small className="text-gray-600">
          {requests.length > 0 && `${requests.length} pending request${requests.length !== 1 ? 's' : ''}`}
        </small>
      </div>

      <div className="p-4">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`pb-2 px-4 text-sm ${activeTab === 'suggestions' ? 'border-b-2 border-blue-500 font-medium text-blue-700' : 'text-gray-700 hover:text-blue-600'}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions
          </button>
          <button
            className={`pb-2 px-4 text-sm ${activeTab === 'requests' ? 'border-b-2 border-blue-500 font-medium text-blue-700' : 'text-gray-700 hover:text-blue-600'}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests {requests.length > 0 && <span className="bg-red-500 text-white rounded-full px-1.5 text-xs ml-1">{requests.length}</span>}
          </button>
          <button
            className={`pb-2 px-4 text-sm ${activeTab === 'sent' ? 'border-b-2 border-blue-500 font-medium text-blue-700' : 'text-gray-700 hover:text-blue-600'}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent
          </button>
          <button
            className={`pb-2 px-4 text-sm ${activeTab === 'friends' ? 'border-b-2 border-blue-500 font-medium text-blue-700' : 'text-gray-700 hover:text-blue-600'}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
        </div>

        {/* Content based on active tab */}
        {renderTabContent()}
      </div>
    </div>
  );
}

export default FriendsWidget;
