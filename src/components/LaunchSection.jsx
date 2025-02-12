import { Box, IconButton, LinearProgress, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import FancyButton from './fancyButton';
import { CloseOutlined, PauseOutlined } from '@mui/icons-material';
import axios from 'axios';

function LaunchSection(props) {
    
    const [gameState, setGameState] = props.gameState
    const [installData, setInstallData] = useState() // eslint-disable-line

    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '65px', flexDirection: 'column' }}>
            {((gameState) => {
                switch (gameState) {
                    case 'notInstalled':
                        return (<FancyButton text="INSTALL" onClick={() => {
                            window.installGame({setInstallData, setGameState})
                        }} />)
                    case 'installed':
                        return (<FancyButton text="LAUNCH" onClick={async () => {
                            console.log('launching')
                            if(props.currServerType === "public") {
                                props.setPopUpState("authenticating")
                                if(localStorage.getItem("authState") !== "true" || !localStorage.getItem("authToken")) {
                                    props.setPopUpState(false)
                                    return alert("You must be logged in to use public servers!")
                                }

                                const res = await axios.post(`${window.config.authServer}/auth/getkey`, {
                                    username: localStorage.getItem("username"),
                                    authToken: localStorage.getItem("authToken"),
                                    server: props.currServer,
                                }).catch((err) => {
                                    props.setPopUpState(false)
                                    alert(err.response.data.message)
                                    return null
                                })
                                if(!res) return

                                if(res.status !== 200) {
                                    props.setPopUpState(false)
                                    return alert(res.data.message)
                                }

                                const authkey = res.data.authkey

                                props.setPopUpState(false)
                                return window.launchGame({setGameState, authkey})
                            } 
                            else return window.launchGame({setGameState})
                        }} />)
                    case 'running':
                        return (<FancyButton text="LAUNCH" disabled={true} style={{ filter: 'grayscale(1)', pointerEvents: 'none'}} />)
                    case 'installing':
                        return (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100%' }}>
                                <p style={{ marginTop: '5px', fontSize: '15px' }}>{installData === 100 ? 'UNPACKING' : 'DOWNLOADING' }</p>
                                <Box style={{ display: 'flex', flexDirection: 'row', width: '90%', justifyContent: 'center', alignItems: 'center' }}>
                                    <LinearProgress style={{ width: '450px', background: '#320853' }} color='secondary' variant={installData === 100 ? 'indeterminate' : 'determinate'} value={installData === 100 ? null : installData} />
                                    <p style={{ fontSize: '15px', marginLeft: '20px', textAlign: 'start', width: '50px' }}>{parseFloat(installData).toFixed(2)}%</p>


                                    <Stack direction={'row'} style={{ marginLeft: 'auto', marginRight: '10px' }}>
                                    <IconButton disabled={installData === 100} style={{ display: `${installData === 100 ? 'none' : 'inline'}` }} onClick={() => {
                                        window.pauseInstall()
                                        setGameState('notInstalled')
                                    }}>
                                        <PauseOutlined style={{ color: '#ffffff' }} />
                                    </IconButton>

                                    <IconButton disabled={installData === 100} style={{ display: `${installData === 100 ? 'none' : 'inline'}` }} onClick={() => {
                                        window.cancelInstall()
                                        setGameState('notInstalled')
                                    }}>
                                        <CloseOutlined style={{ color: '#ffffff' }} />
                                    </IconButton>
                                    </Stack>
                                </Box>
                            </div>
                        )

                    case 'deprecated':
                        return (<FancyButton text="UPDATE" onClick={() => {
                            window.installGame({setInstallData, setGameState})
                        }} />)
                    default:
                        return (<FancyButton text="ERROR" href="#" />)
                        
                }
            })(gameState)}
            {/* <p style={{ fontFamily: 'monospace', marginTop: '5px', fontSize: '15px' }}>VERSION 10.0-264847</p> */}
            <Stack direction="row" style={{ marginTop: '2px', opacity: gameState === 'installing' ? 0 : 1}}>
                <Typography style={{ fontFamily: 'monospace' }}>Server: </Typography>
                <Typography title={props.currServer} style={{ marginLeft: '5px', fontFamily: 'monospace'  }}> {props.currServerName} </Typography>
            </Stack>
        </Box>
    )
}

export default LaunchSection