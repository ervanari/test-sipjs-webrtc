"use client";
import { useEffect, useRef } from "react";
import { acceptCall, hangupCall } from "../lib/sipClient";

interface IncomingCallProps {
  invitation: any;
  onAccept: () => void;
}

export default function IncomingCall({ invitation, onAccept }: IncomingCallProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Create audio context and oscillator for ringtone
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();

      // Configure oscillator
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note

      // Connect nodes
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Set volume
      gainNodeRef.current.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);

      // Start oscillator with ringtone pattern
      oscillatorRef.current.start();

      // Create ringtone pattern (alternating volume)
      const ringPattern = () => {
        if (gainNodeRef.current && audioContextRef.current) {
          gainNodeRef.current.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
          gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime + 0.5);
          gainNodeRef.current.gain.setValueAtTime(0.5, audioContextRef.current.currentTime + 1);
          gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime + 1.5);
        }
      };

      // Start pattern and repeat
      ringPattern();
      const intervalId = setInterval(ringPattern, 2000);

      // Cleanup function
      return () => {
        clearInterval(intervalId);
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      };
    } catch (err) {
      console.error("Failed to create audio context for ringtone:", err);
    }
  }, []);

  const handleAccept = (withVideo: boolean) => {
    if (!invitation) return;

    // Stop ringtone
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    // Accept the call
    acceptCall(invitation, withVideo);

    // Notify parent component
    onAccept();
  };

  const handleReject = () => {
    if (!invitation) return;

    // Stop ringtone
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    // Reject the call
    hangupCall();
  };

  const callerIdentity = invitation?.remoteIdentity?.uri?.toString() || "Unknown";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="animate-pulse mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Incoming Call</h2>
          <p className="text-gray-600 mt-2">{callerIdentity}</p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleAccept(false)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Audio
          </button>

          <button
            onClick={() => handleAccept(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path d="M14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
            </svg>
            Video
          </button>

          <button
            onClick={handleReject}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Reject
          </button>
        </div>

        {/* Ringtone is generated using Web Audio API */}
      </div>
    </div>
  );
}
