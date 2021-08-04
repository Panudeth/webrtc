import { useRef, useState } from "react";
import "./App.css"

// import Peer from 'peerjs';
let pc1
let pc2

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
}
const App = () => {
    // const peer = new Peer('1')

    const localVideo = useRef(null)
    const remoteVideo = useRef(null)
    const [startVideo, setStartVideo] = useState(false)
    const [callVideo, setCallVideo] = useState(false)
    const [localStream, setLocalStream] = useState(null)


    const startVideoCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            // console.log('Received local stream');
            localVideo.current.srcObject = stream;
            // console.log({ localVideo })
            setStartVideo(true)
            setLocalStream(stream)
            // localStream = stream;
            // callButton.disabled = false;
        } catch (e) {
            console.log(e);
        }
    }

    const call = async () => {
        const videoTracks = localStream.getVideoTracks();
        const audioTracks = localStream.getAudioTracks();

        // console.log({ videoTracks, audioTracks })
        pc1 = new RTCPeerConnection({})
        pc2 = new RTCPeerConnection({})
        console.log("****", pc2.addEventListener('track', gotRemoteStream))
        pc2.addEventListener('icecandidate', e => onIceCandidate(pc2, e));
        pc1.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc1, e));
        pc2.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc2, e));
        pc2.addEventListener('track', gotRemoteStream);
        localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
        try {
            // console.log('pc1 createOffer start');
            const offer = await pc1.createOffer(offerOptions);
            await onCreateOfferSuccess(offer);
            setCallVideo(true)
        } catch (e) {
            onCreateSessionDescriptionError(e);
        }
    }

    function onCreateSessionDescriptionError(error) {
        // console.log(`Failed to create session description: ${error.toString()}`);
    }

    function onSetLocalSuccess(pc) {
        // console.log(`${getName(pc)} setLocalDescription complete`);
    }

    function onSetSessionDescriptionError(error) {
        // console.log(`Failed to set session description: ${error.toString()}`);
    }

    function onSetRemoteSuccess(pc) {
        // console.log(`${getName(pc)} setRemoteDescription complete`);
    }

    const onCreateAnswerSuccess = async (desc) => {
        // console.log(`Answer from pc2:\n${desc.sdp}`);
        // console.log('pc2 setLocalDescription start');
        try {
            await pc2.setLocalDescription(desc);
            onSetLocalSuccess(pc2);
        } catch (e) {
            onSetSessionDescriptionError(e);
        }
        // console.log('pc1 setRemoteDescription start');
        try {
            await pc1.setRemoteDescription(desc);
            onSetRemoteSuccess(pc1);
        } catch (e) {
            onSetSessionDescriptionError(e);
        }
    }

    const onCreateOfferSuccess = async (desc) => {
        // console.log(`Offer from pc1\n${desc.sdp}`);
        // console.log('pc1 setLocalDescription start');
        try {
            await pc1.setLocalDescription(desc);
            onSetLocalSuccess(pc1);
        } catch (e) {
            onSetSessionDescriptionError();
        }

        // console.log('pc2 setRemoteDescription start');
        try {
            await pc2.setRemoteDescription(desc);
            onSetRemoteSuccess(pc2);
        } catch (e) {
            onSetSessionDescriptionError();
        }

        // console.log('pc2 createAnswer start');

        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        try {
            const answer = await pc2.createAnswer();
            await onCreateAnswerSuccess(answer);
        } catch (e) {
            onCreateSessionDescriptionError(e);
        }
    }

    const gotRemoteStream = (e) => {
        console.log(">>>>>>>>>>>>>>>>>>", { e })
        if (remoteVideo.current.srcObject !== e.streams[0]) {
            remoteVideo.current.srcObject = e.streams[0];
            // console.log('pc2 received remote stream');
        }
    }

    const getOtherPc = (pc) => {
        return (pc === pc1) ? pc2 : pc1;
    }

    const getName = (pc) => {
        return (pc === pc1) ? 'pc1' : 'pc2';
    }

    const onIceCandidate = async (pc, event) => {
        try {
            await (getOtherPc(pc).addIceCandidate(event.candidate));
            onAddIceCandidateSuccess(pc);
        } catch (e) {
            onAddIceCandidateError(pc, e);
        }
        // console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
    }

    const onAddIceCandidateSuccess = (pc) => {
        // console.log(`${getName(pc)} addIceCandidate success`);
    }

    const onAddIceCandidateError = (pc, error) => {
        // console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
    }

    const onIceStateChange = (pc, event) => {
        if (pc) {
            // console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
            // console.log('ICE state change event: ', event);
        }
    }

    return <div className="App" >
        {startVideo && <div>starting...</div>}
        {callVideo && <div>callVideo</div>}
        <video ref={localVideo} id="localVideo" playsInline autoPlay></video>
        <video ref={remoteVideo} id="remoteVideo" playsInline autoPlay></video>
        <button onClick={startVideoCall}>start</button>
        <button onClick={call}>call</button>
    </div>
}

export default App