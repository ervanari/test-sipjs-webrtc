"use client";
import { useEffect, useRef } from "react";

interface VideoPanelProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export default function VideoPanel({ localStream, remoteStream }: VideoPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Local Video</h2>
        <div className="relative bg-black rounded-lg aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
          {!localStream && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Camera off
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Remote Video</h2>
        <div className="relative bg-black rounded-lg aspect-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              No remote video
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
