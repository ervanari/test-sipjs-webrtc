"use client";
import { useState } from "react";
import { makeCall } from "../lib/sipClient";

interface DialerProps {
  domain: string;
  onCallInitiated?: (session: any) => void;
}

export default function Dialer({ domain, onCallInitiated }: DialerProps) {
  const [target, setTarget] = useState("");
  const [isVideo, setIsVideo] = useState(false);

  const handleCall = async () => {
    if (!target) return;
    const session = await makeCall(`sip:${target}@${domain}`, isVideo);
    if (onCallInitiated && session) {
      onCallInitiated(session);
    }
    return session;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Dialer</h2>
      <div className="mb-4">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Enter SIP address or phone number"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="video-call"
          checked={isVideo}
          onChange={(e) => setIsVideo(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="video-call">Video Call</label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((digit) => (
          <button
            key={digit}
            onClick={() => setTarget(prev => prev + digit)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {digit}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={handleCall}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Call
        </button>
        <button
          onClick={() => setTarget("")}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
