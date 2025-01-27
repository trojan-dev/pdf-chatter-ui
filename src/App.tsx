import { FC, useState } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const PDFChat: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState<string>("");
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState<boolean>(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      alert("Please select a file.");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      setFileLoading(true);
      const response = await fetch(
        "https://pdf-chatter-server.onrender.com/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (response.ok) {
        setFileId(result.fileId);
        alert("File uploaded and processed successfully!");
        setFileLoading(false);
      } else {
        console.error("Error processing file:", result.message);
        setFileLoading(false);
        setFileId(null);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setFileLoading(false);
      setFileId(null);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!fileId) {
      alert("Please upload a PDF file first.");
      return;
    }

    try {
      const response = await fetch(
        "https://pdf-chatter-server.onrender.com/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId,
            message: userMessage,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "user", text: userMessage },
          { role: "assistant", text: result.answer },
        ]);
        setUserMessage("");
      } else {
        console.error("Error fetching chat response:", result.message);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <div>
      <input
        disabled={fileLoading}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />
      <div>
        {messages.map((msg, index) => (
          <p
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              backgroundColor: msg.role === "user" ? "#e0e0e0" : "#f0f0f0",
              padding: "10px",
              borderRadius: "5px",
              margin: "5px 0",
            }}
          >
            {msg.text}
          </p>
        ))}
      </div>
      <input
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Ask about the PDF"
        disabled={!fileId}
        style={{
          width: "80%",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={sendMessage}
        disabled={!fileId || !userMessage.trim()}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </div>
  );
};

export default PDFChat;
