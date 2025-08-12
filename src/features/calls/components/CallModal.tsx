"use client";

import CallButton from "@/features/chats/components/CallButton";
import UserCallContainer from "@/features/chats/components/UserCallContainer";
import { createMessageWithFiles } from "@/features/messages/actions";
import { useCallStore } from "@/store/callStore";
import { CompatClient, Stomp } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { FaCamera, FaMicrophone, FaMicrophoneSlash, FaPhone, FaPhoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2";
import Peer, { SignalData } from "simple-peer";
import IncomingCall from "./IncomingCall";
import IconButton from "@/features/common/components/IconButton";
import { FiMinimize2, FiX } from "react-icons/fi";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import Avatar from "@/features/common/components/Avatar";
import { formatCallDuration } from "@/features/common/lib/utils";
import { useSession } from "next-auth/react";
import Loading from "@/features/common/components/Loading";
import { LuScreenShare, LuScreenShareOff } from "react-icons/lu";

const BASE_WS_URL = process.env.NEXT_PUBLIC_BASE_WS_URL;

type Props = {
    currentUser: User;
    isVideo?: boolean;
    isAudio?: boolean;
}

const CallModal: React.FC<Props> = ({ currentUser }) => {

    const { data: session } = useSession();
    const [errorMessage, setErrorMessage] = useState("");
    const { isCallModalOpen, isCallModalMinimized, callingUser: user, callers, setIsCallModalOpen, setCallingUser, addCaller, removeCaller, setIsCallModalMinimized } = useCallStore();
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCamera, setSelectedCamera] = useState("");
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isScreenShareEnabled, setIsScreenShare] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [, setRemoteStream] = useState<MediaStream | null>(null);
    const [isCalling, setIsCalling] = useState(false);
    const [callerSignal, setCallerSignal] = useState<SignalData | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, ] = useState(false);
    const [duration, setDuration] = useState(0);
    const localVideo = useRef<HTMLVideoElement | null>(null);
    const remoteVideo = useRef<HTMLVideoElement | null>(null);
    const connectionRef = useRef<Peer.Instance | null>(null);
    const stompClient = useRef<CompatClient | null>(null);
    const durationRef = useRef(0);
    const [isPendingCall, startTransition] = useTransition();
    const [isRemoteVideo, setIsRemoteVideo] = useState(false);
    const [isRemoteAudio, setIsRemoteAudio] = useState(true);
    const [firstCaller, setFirstCaller] = useState(true);

    const handleClose = useCallback(() => {
        setIsCallModalOpen(false);
        setCallingUser(null);
        stream?.getTracks().forEach((track) => track.stop());
    }, [setIsCallModalOpen, setCallingUser, stream]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callAccepted) {
            interval = setInterval(() => {
                setDuration(prev => {
                    durationRef.current = prev + 1;
                    return prev + 1;
                });
            }, 1000);
        }
        return () => {
            clearInterval(interval);
        };
    }, [callAccepted]);

    const leaveCall = useCallback(async () => {
        setIsRemoteAudio(true);
        setIsRemoteVideo(false);
        setCallAccepted(false);
        if (isCallModalMinimized) {
            handleClose();
            setIsCallModalMinimized(false);
        }
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
    }, [isCallModalMinimized, handleClose, setIsCallModalMinimized]);

    useEffect(() => {
        const getCameras = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === "videoinput");
            setCameras(videoDevices);
            if (videoDevices.length > 0) {
                setSelectedCamera(videoDevices[0].deviceId);
            }
        };
        getCameras();
    }, []);

    const getCombinedMediaStream = useCallback(async () => {
            try {
              const mediaTracks: MediaStreamTrack[] = [];
        
              if (isVideoEnabled || isMicEnabled) {
                const media = await navigator.mediaDevices.getUserMedia({
                  video: isVideoEnabled,
                  audio: isMicEnabled,
                });
                media.getTracks().forEach(track => mediaTracks.push(track));
              }
        
              if (isScreenShareEnabled) {
                const screen = await navigator.mediaDevices.getDisplayMedia({
                  video: true,
                  audio: false,
                });
                screen.getTracks().forEach(track => mediaTracks.push(track));
              }
        
              const combinedStream = new MediaStream(mediaTracks);
              setStream(combinedStream);
              if (localVideo.current) {
                localVideo.current.srcObject = combinedStream;
              }
              
              if (connectionRef.current) {
                // const senders = connectionRef.current?._pc.getSenders();
              
                // senders.forEach((sender) => {
                //     if (sender.track && sender.streams?.[0]) {
                //         connectionRef.current?.removeTrack(sender.track, sender.streams[0]);
                //         sender.track.stop();
                //     }
                // });
              
                combinedStream.getTracks().forEach((track) => {
                  connectionRef.current?.addTrack(track, combinedStream);
                });
              }
            } catch (err) {
                console.error(err);
                setErrorMessage("Failed to access media devices");
            }
    }, [isMicEnabled, isScreenShareEnabled, isVideoEnabled]);
    
      useEffect(() => {
        if (!isCallModalOpen) return;
        setErrorMessage("");
        getCombinedMediaStream();
    }, [isCallModalOpen, getCombinedMediaStream]);

    useEffect(() => {
        if (stompClient.current) {
            stompClient.current.send("/app/signal", {}, JSON.stringify({ 
                type: "setStream", 
                video: isVideoEnabled, 
                audio: isMicEnabled,
                to: user,
                from: currentUser
            }));
        }
    }, [isVideoEnabled, isAudioEnabled, user, isMicEnabled, currentUser]);

    useEffect(() => {
        if (!session?.user?.accessToken) return;
        stompClient.current = Stomp.over(() => new WebSocket(BASE_WS_URL as string));

        stompClient.current.connect({ Authorization: `Bearer ${session?.user?.accessToken}` }, () => {
            stompClient.current?.subscribe("/topic/signal", (message) => {
                const signal = JSON.parse(message.body);
                if (signal.type === "callUser") {
                    if (signal.userToCall === currentUser.id) {
                        addCaller(signal.from);
                        setCallerSignal(signal.signalData);
                    }
                }
                else if (signal.type === "callEnded" && signal.to.id === currentUser.id) {
                    leaveCall();
                }
                else if (signal.type === "callMissed" && signal.to.id === currentUser.id) {
                    removeCaller(signal.from.id);
                }
                else if (signal.type === "setStream" && signal.to.id === currentUser.id && signal.from.id === user?.id) {
                    setIsRemoteVideo(signal.video);
                    setIsRemoteAudio(signal.audio);
                }
            });
        }, (err: unknown) => {
            console.error(err);
        });


    }, [currentUser, user?.id, addCaller, removeCaller, leaveCall, session?.user?.accessToken]);


    useEffect(() => {
        return () => {
            if (stompClient.current) {
                stompClient.current.disconnect();
            }
        };
    }, []);

    const createCallMessage = useCallback(async (missed: boolean) => {
        if (firstCaller && user) {
            let data;
            if (missed) {
                data = {
                    messageType: "CALL",
                    userId: user.id,
                    missed,
                    duration: null,
                }
            }
            else {
                data = {
                    messageType: "CALL",
                    userId: user.id,
                    missed,
                    duration: durationRef.current,
                }
            }
            const formData = new FormData();
            formData.append("message", new Blob([JSON.stringify(data)], { type: "application/json" }));
            await createMessageWithFiles(formData);
            // setDuration(0);
            // durationRef.current = 0;
        }
    }, [user, firstCaller]);

    const callUser = (id: number) => {
        setFirstCaller(true);
        setIsCalling(true);
        startTransition(() => {
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream as MediaStream
            });
    
            peer.on("signal", (data) => {
                stompClient.current?.send("/app/signal", {}, JSON.stringify({
                    type: "callUser",
                    userToCall: id,
                    signalData: data,
                    from: currentUser,
                }));
            });
    
            peer.on("stream", (stream) => {
                setRemoteStream(stream);
                if (remoteVideo.current) {
                    remoteVideo.current.srcObject = stream;
                }
            });

            peer.on("close", async () => {
                await createCallMessage(false);
                setDuration(0);
                durationRef.current = 0;
                stompClient.current?.send("/app/signal", {}, JSON.stringify({
                    type: "callEnded",
                    to: user
                }));
            })
    
            stompClient.current?.subscribe("/topic/signal", (message) => {
                const signal = JSON.parse(message.body);
                if (signal.to?.id !== currentUser.id) {
                    return;
                }
                if (signal.type === "callAccepted") {
                    removeCaller(signal.from.id);
                    setCallAccepted(true);
                    setIsCalling(false);
                    stompClient.current?.send("/app/signal", {}, JSON.stringify({
                        type: "setStream",
                        video: isVideoEnabled,
                        audio: isMicEnabled,
                        to: signal.from,
                        from: currentUser,
                    }));
                    peer.signal(signal.signal);
                }
                else if (signal.type === "callEnded") {
                    leaveCall();
                }
                else if (signal.type === "callMissed") {
                    removeCaller(signal.from.id);
                }
                else if (signal.type === "setStream" && signal.from.id === user?.id) {
                    setIsRemoteVideo(signal.video);
                    setIsRemoteAudio(signal.audio);
                }
            });

            connectionRef.current = peer;
        });
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isCalling) {
            timeout = setTimeout(() => {
                if (stompClient.current && user) {
                    createCallMessage(true);
                    stompClient.current.send("/topic/signal", {}, JSON.stringify({
                        type: "callMissed",
                        from: currentUser,
                        to: user
                    }));
                }
                setIsCalling(false);
            }, 1000 * 15);
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        }
    }, [isCalling, user, createCallMessage, currentUser]);

    const answerCall = (caller: User) => {
        setFirstCaller(false);
        

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream as MediaStream
        });
        peer.on("signal", (data) => {
            stompClient.current?.send("/app/signal", {}, JSON.stringify({
                type: "callAccepted",
                signal: data,
                from: currentUser,
                to: caller
            }));
        });
        setCallAccepted(true);
        peer.on("close", async () => {
            await createCallMessage(false);
            setDuration(0);
            durationRef.current = 0;
            stompClient.current?.send("/app/signal", {}, JSON.stringify({
                type: "callEnded",
                to: caller
            }));
        });

        peer.on("stream", (stream) => {
            setRemoteStream(stream);
            if (remoteVideo.current) {
                remoteVideo.current.srcObject = stream;
            }
        });

        if (callerSignal) peer.signal(callerSignal);
        connectionRef.current = peer;
        if (stompClient.current) {
            stompClient.current.send("/app/signal", {}, JSON.stringify({
                type: "setStream",
                video: isVideoEnabled,
                audio: isMicEnabled,
                to: caller,
                from: currentUser,
            }));
        }
    };

    const toggleVideo = () => {
        setIsVideoEnabled((prev) => {
            if (stream) {
                const videoTrack = stream.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = !prev;
                    if (prev) videoTrack.stop();
                }
            }
            return !prev;
        });
    };
    
    const toggleMic = () => {
        setIsMicEnabled((prev) => {
            if (stream) {
                const audioTrack = stream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = !prev;
                    if (prev) audioTrack.stop();
                }
            }
            return !prev;
        });
    };

    const toggleAudio = () => {
        setIsAudioEnabled(!isAudioEnabled);
    }

    const toggleScreenShare = () => {
        setIsScreenShare(!isScreenShareEnabled);
    }

    const switchCameras = () => {
        const selectedIndex = cameras.findIndex(camera => camera.deviceId === selectedCamera);
        const nextIndex = (selectedIndex + 1) % cameras.length;
        setSelectedCamera(cameras[nextIndex].deviceId);
    }

    if (!isCallModalOpen) {
        return (
            <div className="absolute z-30 right-10 top-14 space-y-2 overflow-y-auto">
                {
                    callers.map(caller => (
                        <IncomingCall caller={caller} key={caller.id} answerCall={answerCall} />
                    ))
                }
            </div>
        );
    }

    if (isCallModalMinimized) {
        return (
            <div className="absolute z-30 right-10 top-14 flex flex-col items-center justify-center gap-3">
                <div className="space-y-2">
                    {
                        callers.map(caller => (
                            <IncomingCall caller={caller} key={caller.id} answerCall={answerCall} />
                        ))
                    }
                </div>
                {
                    callAccepted && user &&
                    <span onClick={() => setIsCallModalMinimized(false)}>
                        <Avatar className="cursor-pointer shadow-lg" size={50} image={user?.image} alt={user.username} />
                    </span>
                }
            </div>
        );
    }

    return (
        <div className="h-svh flex items-center flex-col bg-background-secondary fixed top-0 left-0 w-full">
            <div className="absolute z-30 right-10 top-14">
                {
                    callers.map(caller => (
                        <IncomingCall caller={caller} key={caller.id} answerCall={answerCall} />
                    ))
                }
            </div>
            <span className="absolute top-4 right-4">
                {
                    callAccepted ?
                    <IconButton onClick={() => setIsCallModalMinimized(true)}>
                        <FiMinimize2 size={22} />
                    </IconButton>
                    :
                    <IconButton onClick={handleClose}>
                        <FiX size={22} />
                    </IconButton>
                }
            </span>
            <div className="flex-1 relative flex items-center justify-center gap-6">
                {
                    callAccepted && !callEnded && connectionRef?.current &&
                    <video playsInline ref={remoteVideo} muted={!isAudioEnabled || !isRemoteAudio} autoPlay className={`rounded-lg w-[40rem] ${isRemoteVideo ? "" : "hidden"}`} /> 
                }
                <video 
                    playsInline 
                    ref={localVideo}
                    muted
                    autoPlay 
                    className={`rounded-lg ${callAccepted && isRemoteVideo && !callEnded ? "absolute left-4 top-8 w-32" : "w-[40rem]" } ${!isVideoEnabled && !isScreenShareEnabled ? "hidden" : ""}`} 
                />
                {
                    !isVideoEnabled &&
                    <UserCallContainer muted={!isMicEnabled} user={currentUser} />
                }
                {
                    !isRemoteVideo && callAccepted && !callEnded &&
                    <UserCallContainer muted={!isRemoteAudio} user={user as User} />
                }
            </div>
            <div className="flex py-4 gap-5 items-center justify-center">
                {
                    callAccepted && !callEnded ?
                    <CallButton className="bg-red-500" onClick={leaveCall}>
                        <FaPhoneSlash size={25} className="text-white" />
                    </CallButton>
                    :
                    isCalling ?
                    <CallButton disabled={isPendingCall} className="bg-primary">
                        <Loading size={30} />
                    </CallButton>
                    :
                    <CallButton disabled={isPendingCall} className="bg-green-500" onClick={() => callUser(user?.id as number)}>
                        <FaPhone size={25} className="text-white" />
                    </CallButton>
                }
                <CallButton className={isVideoEnabled ? "bg-blue-500" : "bg-red-500"} onClick={toggleVideo}>
                    {
                        isVideoEnabled ?
                        <FaVideo size={25} className="text-white" />
                        :
                        <FaVideoSlash size={25} className="text-white" />
                    }
                </CallButton>
                <CallButton className={isMicEnabled ? "bg-blue-500" : "bg-red-500"} onClick={toggleMic}>
                    {
                        isMicEnabled ?
                        <FaMicrophone size={25} className="text-white" />
                        :
                        <FaMicrophoneSlash size={25} className="text-white" />
                    }
                </CallButton>
                <CallButton className={isAudioEnabled ? "bg-blue-500" : "bg-red-500"} onClick={toggleAudio}>
                    {
                        isAudioEnabled ?
                        <HiMiniSpeakerWave size={25} className="text-white" />
                        :
                        <HiMiniSpeakerXMark size={25} className="text-white" />
                    }
                </CallButton>
                <CallButton className={isScreenShareEnabled ? "bg-blue-500" : "bg-red-500"} onClick={toggleScreenShare}>
                    {
                        isScreenShareEnabled ?
                        <LuScreenShare size={25} className="text-white" />
                        :
                        <LuScreenShareOff size={25} className="text-white" />
                    }
                </CallButton>
                {
                    cameras.length > 1 && isVideoEnabled &&
                    <CallButton className="bg-primary" onClick={switchCameras}>
                        <FaCamera size={25} className="text-white" />
                    </CallButton>
                }
            </div>
            {
                duration > 0 &&
                <p className="text-xs text-muted font-bold text-center">
                    {formatCallDuration(duration)}
                </p>
            }
            <ErrorMessage message={errorMessage} isActive={!!errorMessage} />
        </div>
    );
}

export default CallModal;