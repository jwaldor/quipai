import { useState } from "react";
import DisplayUsers from "./pages/DisplayUsers";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <DisplayUsers />
    </>
  );
}

export default App;
