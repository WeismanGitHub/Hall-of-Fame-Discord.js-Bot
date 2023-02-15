import { Menu, Item, useContextMenu } from 'react-contexify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'react-contexify/ReactContexify.css';
import axios, * as others from 'axios'
import 'reactjs-popup/dist/index.css'
import Popup from 'reactjs-popup';
import Cookies from 'js-cookie';

import View from './view'
import Login from './login'

function Main() {
    const createQuote = { name: 'create quote', iconURL: '/create-quote.png', id: null }
    const [loggedIn, setLoggedIn] = useState(Cookies.get('loggedIn'))
    const [guilds, setGuilds] = useState([createQuote])
    const [guildId, setGuildId] = useState(null)
    const navigate = useNavigate()
    const contextId = 'guild_id'
    const contentStyle = {
        background: '#2f3136',
        border: "#232428 2px solid",
        'border-radius': '5px',
        width: '275px', height: '150px',
        'text-align': 'center'
    }

    const { show } = useContextMenu({
        id: contextId
    });

    function handleContextMenu(event, props) {
        show({ event, props })
    }

    const handleItemClick = ({ id, props }) => {
        const { guildId } = props

        switch (id) {
        case "create-quote":
            console.log('create quote', guildId)
            break;
        case "create-tag":
            console.log('create tag', guildId)
            break;
        case "create-author":
            console.log('create author', guildId)
            break;
        }
    }

    useEffect(() => {
        const code = String(window.location).split('code=')[1]

        if (loggedIn) {
            axios.get('/api/v1/guilds').then(res => setGuilds(guilds.concat(res.data)))
            return
        }

        axios.post('/api/v1/auth', { code: code })
        .then(res => {
            return axios.get('/api/v1/guilds')
        }).then(res => {
            setGuilds(guilds.concat(res.data))
            setLoggedIn(true)
        }).catch(err =>
            navigate('/login')
        )
    }, [])
    
    function guildIconClick(id) {
        setGuildId(id)
    }

    function logout() {
        if (window.confirm('Are you sure you want to logout?')) {
            axios.post('/api/v1/logout')
            .then(navigate('/login'))
        }
    }
    
    return (<>
        <body>
            {
                !loggedIn ?
                    <Login/>
                :
                    <div>
                        <div class='guilds'>
                            { guilds.map(guild => <div
                                onContextMenu={(e) => guilds.indexOf(guild) ? handleContextMenu(e, { guildId: guild.id }) : null}
                            >
                                <img class={ guildId == guild.id ? 'chosen_guild' : 'unchosen_guild'}
                                    src={ guild.iconURL || "/icon.png" }
                                    alt="server icon"
                                    width = "60"
                                    height = "60"
                                    title = { guild.name }
                                    onClick={ () => guildIconClick(guild.id) }>
                                </img>
                                
                                { !guilds.indexOf(guild) && <hr class="guilds_divider"/>}
                            </div>) }
                            
                            <a href="https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot#readme">
                                <img class='unchosen_guild'
                                    src='/question-mark.png'
                                    alt="readme button"
                                    width = "60"
                                    height = "60"
                                    title = 'readme'
                                />
                            </a>
                            <img class='unchosen_guild'
                                src='/logout.png'
                                alt="logout button"
                                width = "60"
                                height = "60"
                                title = 'logout'
                                onClick={ logout }>
                            </img>
                        </div>
                        <Menu id={contextId} theme="dark">
                            <Item id="create-quote" onClick={handleItemClick}>Create Quote</Item>
                            <Item id="create-tag" onClick={handleItemClick}>Create Tag</Item>
                            <Item id="create-author" onClick={handleItemClick}>Create Author</Item>
                        </Menu>
                    <View guildId={ guildId } setGuildId={ setGuildId } guildName={ guilds.find((guild) => guild.id == guildId)?.name }/>
                </div>
            }

            <Popup
                open={localStorage.getItem('showInfoPopup') == 'false' ? false : true}
                position="center center"
                modal
                {...{ contentStyle }}
            >
                {close => <>
                    Right click on servers, quotes, authors, and tags for more options!
                    <button class='info_popup' onClick={close}>close</button>
                    <button class='info_popup' onClick={() => {close(); localStorage.setItem('showInfoPopup', 'false')}}>don't show again</button>
                </>}
            </Popup>
        </body>

        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />
    </>)
}

export default Main;