import { useState, useEffect } from 'react';
import { useFriendStore } from '../store/useFriendStore';
import { UserPlus, UserMinus, UserCheck, Clock } from 'lucide-react';

const FriendButton = ({ userId, fullName }) => {
  const [status, setStatus] = useState('loading');
  const { 
    friends, requests, sentRequests,
    fetchFriends, fetchRequests, fetchSentRequests, 
    sendRequest, acceptRequest, declineRequest, removeFriend, cancelRequest 
  } = useFriendStore();

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      
      await Promise.all([
        fetchFriends(),
        fetchRequests(),
        fetchSentRequests()
      ]);
      
      // Determine relationship status
      if (friends.some(f => f._id === userId)) {
        setStatus('friends');
      } else if (requests.some(r => r._id === userId)) {
        setStatus('incoming');
      } else if (sentRequests.some(r => r._id === userId)) {
        setStatus('outgoing');
      } else {
        setStatus('none');
      }
    };
    
    loadData();
  }, [userId, fetchFriends, fetchRequests, fetchSentRequests, friends, requests, sentRequests]);

  const handleClick = async () => {
    if (!userId) return;

    switch (status) {
      case 'none':
        await sendRequest(userId);
        setStatus('outgoing');
        break;
      case 'incoming':
        await acceptRequest(userId);
        setStatus('friends');
        break;
      case 'friends':
        await removeFriend(userId);
        setStatus('none');
        break;
      case 'outgoing':
        await cancelRequest(userId);
        setStatus('none');
        break;
      default:
        break;
    }
  };

  if (status === 'loading') {
    return (
      <button className="px-4 py-2 rounded-md bg-gray-200 text-gray-500 flex items-center gap-2" disabled>
        <Clock size={18} />
        <span>Loading...</span>
      </button>
    );
  }

  if (status === 'friends') {
    return (
      <button 
        onClick={handleClick}
        className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
      >
        <UserCheck size={18} />
        <span>Friends</span>
      </button>
    );
  }

  if (status === 'incoming') {
    return (
      <div className="flex gap-2">
        <button 
          onClick={handleClick}
          className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
        >
          <UserCheck size={18} />
          <span>Accept</span>
        </button>
        <button 
          onClick={() => {
            declineRequest(userId);
            setStatus('none');
          }}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
        >
          <UserMinus size={18} />
          <span>Decline</span>
        </button>
      </div>
    );
  }

  if (status === 'outgoing') {
    return (
      <button 
        onClick={handleClick}
        className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
      >
        <Clock size={18} />
        <span>Request Sent</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
    >
      <UserPlus size={18} />
      <span>Add Friend</span>
    </button>
  );
};

export default FriendButton;
