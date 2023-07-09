import { useState } from "react";

const ChatBox = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSendMessage = async () => {
    const flaskUrl = "http://127.0.0.1:5000/answer"; // Replace with your Flask server URL

    try {
      const flaskResponse = await fetch(flaskUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors", // Enable CORS
        body: JSON.stringify({
          question: prompt,
        }),
      });

      const flaskData = await flaskResponse.json();
      const flaskAnswer = flaskData.answer;

      // Display Flask response in the console
      console.log("Flask response:", flaskAnswer);

      setResponse(flaskAnswer);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div>
      <div>
        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      {response && <div>{response}</div>}
    </div>
  );
};

export default ChatBox;