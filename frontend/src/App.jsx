import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Home from "./pages/Home";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Notifications from "./Components/Notifications";

function App() {
  // const [count, setCount] = useState(0);
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  return (
    <>
      {/* Unauthorized */}
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/login" />}
        ></Route>
        {authUser?.role === "user" ? (
          <>
            <Route
              path="/"
              element={authUser ? <Home /> : <Navigate to="/login" />}
            ></Route>
            <Route
              path="/profile"
              element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
            ></Route>
            <Route
              path="/message"
              element={authUser ? <HomePage /> : <Navigate to="/login" />}
            ></Route>

            <Route path="/admin" element={<Navigate to="/" />}></Route>
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/admin" />}></Route>
            <Route
              path="/admin"
              element={authUser ? <AdminPage /> : <Navigate to="/login" />}
            ></Route>
            <Route path="/profile" element={<Navigate to="/admin" />}></Route>
            <Route path="/message" element={<Navigate to="/admin" />}></Route>
          </>
        )}
      </Routes>
     {/* <Notifications /> */}
      <Toaster />
    </>
  );
}

export default App;
