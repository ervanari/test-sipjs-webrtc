"use client";
import { useState, forwardRef, useImperativeHandle } from "react";
import { sendMessage } from "../lib/sipClient";

interface MessagingProps {
  domain: string;
  onMessageReceived?: (from: string, body: string) => void;
}

const Messaging = forwardRef<{addReceivedMessage: (from: string, body: string) => void}, MessagingProps>(
  ({ domain }, ref) => {
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{from: string; body: string; time: Date}[]>([]);

  const handleSendMessage = () => {
    if (!target || !message) return;

    sendMessage(`sip:${target}@${domain}`, message);

    // Add to local messages list
    setMessages(prev => [
      ...prev,
      {
        from: "me",
        body: message,
        time: new Date()
      }
    ]);

    // Clear message input
    setMessage("");
  };

  // This function is called when a message is received
  const addReceivedMessage = (from: string, body: string) => {
    setMessages(prev => [
      ...prev,
      {
        from,
        body,
        time: new Date()
      }
    ]);
  };

  // Expose the addReceivedMessage function to parent components
  useImperativeHandle(ref, () => ({
    addReceivedMessage
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Messaging</h2>

      <div className="mb-4">
        <label htmlFor="message-target" className="block text-sm font-medium text-gray-700 mb-1">
          Recipient
        </label>
        <input
          id="message-target"
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Enter SIP address"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {messages.length > 0 && (
        <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded p-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${msg.from === 'me' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-[80%]`}
            >
              <div className="text-sm font-semibold">{msg.from === 'me' ? 'You' : msg.from}</div>
              <div>{msg.body}</div>
              <div className="text-xs text-gray-500">
                {msg.time.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!target || !message}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
});

export default Messaging;
