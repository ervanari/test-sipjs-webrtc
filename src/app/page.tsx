"use client";
import { useEffect, useState, useRef } from "react";
import SIPRegistration from "../components/SIPRegistration";
import Dialer from "../components/Dialer";
import CallControls from "../components/CallControls";
import VideoPanel from "../components/VideoPanel";
import Messaging from "../components/Messaging";
import IncomingCall from "../components/IncomingCall";

export default function Home() {
  // SIP registration state
  const [isRegistered, setIsRegistered] = useState(false);
  const [domain, setDomain] = useState("");

  // Call state
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [inCall, setInCall] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);

  // Media streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Refs for component methods
  const messagingRef = useRef<any>(null);

  // Handle successful registration
  const handleRegistered = (domainName: string) => {
    setIsRegistered(true);
    setDomain(domainName);
  };

  // Handle incoming call
  const handleIncomingCall = (invitation: any) => {
    setIncomingCall(invitation);
  };

  // Handle received message
  const handleMessageReceived = (message: string, from: string) => {
    // Extract username from SIP URI
    const fromUser = from.split(':')[1]?.split('@')[0] || from;

    // Add to message history in Messaging component
    if (messagingRef.current) {
      messagingRef.current.addReceivedMessage(fromUser, message);
    }
  };

  // Handle call acceptance
  const handleCallAccepted = () => {
    setInCall(true);
    setIncomingCall(null);
    setCurrentSession(incomingCall);

    // Get media streams
    if (incomingCall) {
      const pc = incomingCall.sessionDescriptionHandler.peerConnection;

      // Get local stream
      const localMediaStream = new MediaStream();
      pc.getSenders().forEach((s: RTCRtpSender) => {
        if (s.track) localMediaStream.addTrack(s.track);
      });
      setLocalStream(localMediaStream);

      // Get remote stream
      const remoteMediaStream = new MediaStream();
      pc.getReceivers().forEach((r: RTCRtpReceiver) => {
        if (r.track) remoteMediaStream.addTrack(r.track);
      });
      setRemoteStream(remoteMediaStream);
    }
  };

  // Handle outgoing call
  const handleOutgoingCall = async (session: any) => {
    setInCall(true);
    setCurrentSession(session);

    // Listen for call establishment to get media streams
    session.stateChange.addListener((state: string) => {
      if (state === "Established") {
        const pc = session.sessionDescriptionHandler.peerConnection;

        // Get local stream
        const localMediaStream = new MediaStream();
        pc.getSenders().forEach((s: RTCRtpSender) => {
          if (s.track) localMediaStream.addTrack(s.track);
        });
        setLocalStream(localMediaStream);

        // Get remote stream
        const remoteMediaStream = new MediaStream();
        pc.getReceivers().forEach((r: RTCRtpReceiver) => {
          if (r.track) remoteMediaStream.addTrack(r.track);
        });
        setRemoteStream(remoteMediaStream);
      } else if (state === "Terminated") {
        // Call ended
        setInCall(false);
        setLocalStream(null);
        setRemoteStream(null);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">📞 WebRTC Softphone</h1>

      {/* SIP Registration */}
      <div className="mb-6">
        <SIPRegistration
          onRegistered={handleRegistered}
          onIncomingCall={handleIncomingCall}
          onMessageReceived={handleMessageReceived}
        />
      </div>

      {/* Main content - only show when registered */}
      {isRegistered && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* Dialer */}
            <Dialer domain={domain} onCallInitiated={handleOutgoingCall} />

            {/* Call Controls - only show during a call */}
            <CallControls domain={domain} inCall={inCall} />

            {/* Messaging */}
            <Messaging
              domain={domain}
              ref={messagingRef}
            />
          </div>

          {/* Video Panel */}
          <VideoPanel localStream={localStream} remoteStream={remoteStream} />
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCall
          invitation={incomingCall}
          onAccept={handleCallAccepted}
        />
      )}
    </div>
  );
}
