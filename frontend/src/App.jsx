import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Left from "./Components/Left";
import Middle from "./Components/Middle";
import Right from "./Components/Right";
import Navbar from "./Components/Navbar";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Navbar></Navbar>
      <main>
        <div className="container">
          <Left></Left>
          <Middle></Middle>
          <Right></Right>
        </div>
      </main>
    </>
  );
}

export default App;
