import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getMessage = async () => {
      const res = await fetch("http://localhost:5000");
      const data = await res.json();
      setMessage(data.message);
    };

    getMessage();
  }, []);

  return (
    <div>
      <h1>Frontend</h1>
      <p>Message from backend: {message}</p>
    </div>
  );
}

export default App;
