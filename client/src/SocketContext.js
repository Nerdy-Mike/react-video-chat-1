import React, { createContext, useState, useRef, useEffect} from 'react';
import {io} from 'socket.io-client'
import Peer from 'simple-peer';


const SocketContext = createContext();
const socket = io('http://localhost:5000');

const ContextProvider = ({ children }) => {

    const [ stream, setStream ] = useState(null);
    const [ me, setMe ] = useState("");
    const [ call, setCall ] = useState({});
    const [ callAccepted, setCallAccepted ] = useState(false)
    const [ callEnded, setCallEnded ] = useState(false)
    const [ name, setName ] = useState('')


    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        //what you want to do as soon as the page load?
        //permission for audio and cameras
        navigator.mediaDevices.getUserMedia({ video: true, audio: true})
                    .then((currentStream) =>{
                        setStream(currentStream)
                        myVideo.current.srcObject = currentStream;
                        //set a ref, which is going to populate the video iframe
                    })
                    
        socket.on('me', (id) => setMe(id))
        //this will emit our id as soon as the connection opens (set up in server)

        socket.on('calluser', ({from, name: callerName, signal}) => {
            setCall({isReceivedCall: true, from, name: callerName, signal})
            //isReceivedCall is set because the user may call or receive a call
        })
    },[])
    //Reminder: useEffect have to include [], or [variable to keep track], otherwise it will keep running

    const answerCall = () => {
        setCallAccepted(true)
        
        const peer = new Peer({ initiator: false, trickle: false, stream})
        //initiator: false because user did not initialized the call
        //stream contain permission to audio and video?
        peer.on('signal', (data) => { //getting data about the signal
            socket.emit('answercall', { signal: data, to: call.from})
        })

        peer.on('stream', (currentStream) =>{
            userVideo.current.srcObject = currentStream;
        })

        peer.signal(call.signal)

        connectionRef.current = peer;
        //current connection 
    }

    const callUser = (id) => {

        const peer = new Peer({ initiator: true, trickle: false, stream})

        peer.on('signal', (data) => { //getting data about the signal
            socket.emit('calluser', { userToCall: id, signalData: data, from: me, name})
        })

        peer.on('stream', (currentStream) =>{
            userVideo.current.srcObject = currentStream;
        })

        socket.on('callaccepted', signal =>{
            setCallAccepted(true);
            peer.signal(signal);
        })

        connectionRef.current = peer;
    }

    const leaveCall = () => {
        setCallEnded(true);

        connectionRef.current.destroy(); //destroy connection -> stop receive input from the user's camera and audio

        window.location.reload(); //reload the page and provide user with a new id
        //without reload, user cannot immediately call another user
        //find a way to get around this
    }
    return (
        <SocketContext.Provider value={{ call, callAccepted, callEnded, myVideo, userVideo, stream, name, setName, me, callUser, answerCall, leaveCall,}}>

            {children}
            
        </SocketContext.Provider>
    )
}

export { ContextProvider, SocketContext }

//this is how context works, {children} inside means all the components we will have in there are going to be inside of that socket wrapper into it

//TODO: hook this logic into components










