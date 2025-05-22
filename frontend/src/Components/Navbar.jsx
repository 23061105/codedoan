import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  UserPlus,
  Bell,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Navbar Component
 *
 * This component includes friend request notification functionality:
 * - Displays a notification bell with count of pending friend requests
 * - Shows a dropdown with friend request details when clicked
 * - Provides buttons to accept or decline requests directly from the navbar
 */
const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { friendRequests, fetchFriendRequests } = useFriendStore();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch friend requests when the component mounts
  useEffect(() => {
    if (authUser) {
      fetchFriendRequests();
    }
  }, [fetchFriendRequests, authUser]);
  return (
    <header
      className="border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {authUser && authUser?.role !== "admin" && (
              <div className="relative">
                {/* Friend request notification bell with counter badge */}
                <button
                  className="btn btn-sm gap-2 transition-colors relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-4 h-4" />
                  {/* Badge showing number of pending requests */}
                  {friendRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {friendRequests.length}
                    </span>
                  )}
                </button>

                {/* Friend request dropdown menu */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl rounded-lg z-50">
                    <div className="p-3 border-b">
                      <h3 className="font-medium">Friend Requests</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {friendRequests.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No new notifications
                        </div>
                      ) : (
                        friendRequests.map((request) => (
                          <Link
                            key={request._id}
                            to="/profile"
                            className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b"
                            onClick={() => {
                              setShowNotifications(false);
                            }}
                          >
                            {/* Friend request sender info */}
                            <div className="flex-shrink-0">
                              <img
                                src={request.from.profilePic || "/avatar.png"}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p>
                                <span className="font-medium">
                                  {request.from.fullName}
                                </span>
                                <span className="text-gray-600">
                                  {" "}
                                  sent you a friend request
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            {/* Accept/decline buttons */}
                            <div className="flex gap-1">
                              <button
                                className="p-1 bg-primary text-white rounded-full"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  useFriendStore
                                    .getState()
                                    .respondToFriendRequest(request._id, true);
                                  setShowNotifications(false);
                                }}
                              >
                                <User className="w-3 h-3" />
                              </button>
                              <button
                                className="p-1 bg-gray-200 rounded-full"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  useFriendStore
                                    .getState()
                                    .respondToFriendRequest(request._id, false);
                                  setShowNotifications(false);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
