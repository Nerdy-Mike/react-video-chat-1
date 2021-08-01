import React, { useState, useContext } from 'react';
import { Button } from '@material-ui/core'

import { SocketContext } from '../SocketContext'

const Notifications = () => {
    const { answerCall, call, callAccepted, callEnded, leaveCall } = useContext(SocketContext)

    return (
        <>
            {call.isReceivedCall && !callAccepted &&(
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <h1 style={{paddingRight: '20px'}}>{call.name} is calling</h1>
                    <Button variant='contained' color="primary" onClick={()=>answerCall()} style={{paddingRight: '20px'}} >Answer</Button>
                    <Button color='secondary' onClick={()=>leaveCall()} >Declined</Button>
                </div>
            )}
        </>
    )
}

export default Notifications
