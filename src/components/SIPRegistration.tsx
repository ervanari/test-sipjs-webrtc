"use client";
import { useState } from "react";
import { initSIP } from "../lib/sipClient";

interface SIPRegistrationProps {
  onRegistered: (domain: string) => void;
  onIncomingCall: (invitation: any) => void;
  onMessageReceived?: (message: string, from: string) => void;
}

export default function SIPRegistration({ onRegistered, onIncomingCall, onMessageReceived }: SIPRegistrationProps) {
  const [sipUri, setSipUri] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [wsServer, setWsServer] = useState("wss://jsmwebrtc.my.id:443/ws");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setIsRegistering(true);
    setError("");

    try {
      // Extract domain from SIP URI, handling different formats
      const atIndex = sipUri.lastIndexOf('@');
      const domain = atIndex !== -1 ? sipUri.substring(atIndex + 1) : null;

      console.log("SIP URI:", sipUri);
      if (!domain) {
        throw new Error("Invalid SIP URI format. Expected format: user@domain or sip:user@domain");
      }

      // Initialize SIP client
      await initSIP({
        uri: sipUri,
        password: password,
        wsServer: wsServer,
        onInvite: onIncomingCall,
        onMessage: onMessageReceived,
      });

      setIsRegistered(true);
      onRegistered(domain);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register SIP account");
      console.error("SIP registration error:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <p className="text-green-700 font-medium">Registered as {sipUri}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">SIP Registration</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="sip-uri" className="block text-sm font-medium text-gray-700 mb-1">
            SIP URI
          </label>
          <input
            id="sip-uri"
            type="text"
            value={sipUri}
            onChange={(e) => setSipUri(e.target.value)}
            placeholder="user@domain.com"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username for authentication"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="ws-server" className="block text-sm font-medium text-gray-700 mb-1">
            WebSocket Server
          </label>
          <input
            id="ws-server"
            type="text"
            value={wsServer}
            onChange={(e) => setWsServer(e.target.value)}
            placeholder="wss://example.com:8089/ws"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={isRegistering || !sipUri || !password || !wsServer}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isRegistering ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
}
