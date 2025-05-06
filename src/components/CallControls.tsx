"use client";
import { useState } from "react";
import { hangupCall, transferCall, muteCall } from "../lib/sipClient";

interface CallControlsProps {
  domain: string;
  inCall: boolean;
}

export default function CallControls({ domain, inCall }: CallControlsProps) {
  const [transferTarget, setTransferTarget] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  const handleHangup = () => {
    hangupCall();
  };

  const handleMuteToggle = () => {
    const success = muteCall(!isMuted);
    if (success) {
      setIsMuted(!isMuted);
    }
  };

  const handleTransfer = () => {
    if (!transferTarget) return;
    transferCall(`sip:${transferTarget}@${domain}`);
  };

  if (!inCall) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Call Controls</h2>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleHangup}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Hang Up
        </button>

        <button
          onClick={handleMuteToggle}
          className={`${isMuted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Transfer Call</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={transferTarget}
            onChange={(e) => setTransferTarget(e.target.value)}
            placeholder="Enter transfer target"
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTransfer}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
