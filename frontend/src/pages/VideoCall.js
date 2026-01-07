import React, { useEffect, useRef, useState } from 'react';
import { initSocket, joinRooms, getSocket } from '../services/socket';

export default function VideoCall() {
  const localRef = useRef();
  const remoteRef = useRef();
  const pcRef = useRef();
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const socket = initSocket();
    if (user) joinRooms({ userId: user.id });

    // signaling handlers
    socket.on('webrtc_offer', async (data) => {
      console.log('offer received');
      await ensurePeerConnection();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit('webrtc_answer', answer);
    });

    socket.on('webrtc_answer', async (data) => {
      console.log('answer received');
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
    });

    socket.on('webrtc_ice_candidate', async (candidate) => {
      if (pcRef.current) await pcRef.current.addIceCandidate(candidate);
    });

    return () => {
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
    };
  }, []);

  async function ensurePeerConnection() {
    if (pcRef.current) return;
    pcRef.current = new RTCPeerConnection();
    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) getSocket().emit('webrtc_ice_candidate', e.candidate);
    };
    pcRef.current.ontrack = (e) => {
      remoteRef.current.srcObject = e.streams[0];
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localRef.current.srcObject = stream;
    stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));
    setInCall(true);
  }

  async function startCall() {
    await ensurePeerConnection();
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    getSocket().emit('webrtc_offer', offer);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Video Call Demo (signaling only)</h2>
      <div style={{ display: 'flex', gap: 10 }}>
        <video ref={localRef} autoPlay playsInline muted style={{ width: 240, height: 180, background: '#000' }} />
        <video ref={remoteRef} autoPlay playsInline style={{ width: 480, height: 360, background: '#000' }} />
      </div>
      <div style={{ marginTop: 10 }}>
        {!inCall ? <button onClick={startCall}>Start Call (send offer)</button> : <button disabled>In call</button>}
      </div>
      <p>Note: This demo provides basic WebRTC signaling via Socket.IO; full production code needs STUN/TURN servers and room management.</p>
    </div>
  );
}
