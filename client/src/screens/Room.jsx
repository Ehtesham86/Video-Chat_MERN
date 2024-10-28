import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
console.log(remoteSocketId,'remoteSocketId')
  const handleUserJoined = useCallback(({ id }) => {
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
  
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
  
      stream.getTracks().forEach((track) => {
        peer.peer.addTrack(track, stream);
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Could not access media devices. Please ensure your camera and microphone are connected and allowed.");
    }
  }, [remoteSocketId, socket]);
  
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    const hasVideo = devices.some(device => device.kind === "videoinput");
    const hasAudio = devices.some(device => device.kind === "audioinput");
  
    if ( !hasAudio) {
      alert("No video or audio devices found. Please connect a camera and microphone.");
    }
  });
  
  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
  
        const answer = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, answer });
  
        stream.getTracks().forEach((track) => {
          peer.peer.addTrack(track, stream);
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
        alert("Could not access media devices. Please ensure your camera and microphone are connected and allowed.");
      }
    },
    [socket]
  );
  

  const handleCallAccepted = useCallback(
    ({ answer }) => {
      peer.setLocalDescription(answer);
    },
    []
  );

  useEffect(() => {
    peer.peer.addEventListener("track", (event) => {
      setRemoteStream(event.streams[0]);
    });

    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  return (
    <div>
      <h1>Room Page</h1>
      {myStream && (
        <>
          <h2>My Stream</h2>
          <ReactPlayer url={URL.createObjectURL(myStream)} playing muted />
        </>
      )}
  {remoteStream ? (
  <>
    <h2>Remote Stream</h2>
    <ReactPlayer url={URL.createObjectURL(remoteStream)} playing />
  </>
) : <p>Waiting for remote stream...</p>}

    </div>
  );
};

export default Room;
