import { useRef, useState } from "react";
import "./App.css"

// import Peer from 'peerjs';

const App = () => {
    // const peer = new Peer('1')

    const localVideo = useRef(null)
    const [startVideo, setStartVideo] = useState(false)

    const startVideoCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            console.log('Received local stream');
            localVideo.current.srcObject = stream;
            console.log({ localVideo })
            setStartVideo(true)
            // localStream = stream;
            // callButton.disabled = false;
        } catch (e) {
            console.log(e);
        }
    }

    return <div className="App" >
        {startVideo && <div>starting</div>}
        <video ref={localVideo} id="localVideo" playsInline autoPlay></video>
        <button onClick={startVideoCall}>start</button>
    </div>
}

export default App