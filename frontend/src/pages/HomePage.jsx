import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import { useEffect } from "react";

import Sidebar from "../Components/Sidebar";
import NoChatSelected from "../Components/NoChatSelected";
import ChatContainer from "../Components/ChatContainer";
import UserSearch from "../Components/UserSearch";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { fetchFriends, fetchFriendRequests, fetchSentRequests } = useFriendStore();
  
  useEffect(() => {
    // Fetch friend data when component mounts
    fetchFriends();
    fetchFriendRequests();
    fetchSentRequests();
  }, [fetchFriends, fetchFriendRequests, fetchSentRequests]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-100/50">
                <NoChatSelected />
                <div className="hidden md:block">
                  <UserSearch />
                </div>
              </div>
            ) : (
              <ChatContainer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
