import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import Cookies from 'js-cookie';

import Guild from './guild'
import Home from './home'

function Main() {
    const [loggedIn, setLoggedIn] = useState(Cookies.get('loggedIn'))
    const home = { name: 'home', iconURL: '/icon.png', id: '' }
    const [guilds, setGuilds] = useState([home])
    const navigate = useNavigate()
    const [guildId, setGuildId] = useState(useParams().guildId)

    useEffect(() => {
        const code = String(window.location).split('code=')[1]

        if (code && !loggedIn) {
            axios.post('/api/v1/auth', { code: code })
            .then(res => setLoggedIn(true))
            .catch(err => setLoggedIn(false))
        }
        
        if (!loggedIn) {
            return navigate('/login')
        }

        axios.get('/api/v1/guilds').then(res => {
            setGuilds(guilds.concat(res.data))
        })
    }, [])
    
    function guildIconClick(id) {
        window.history.replaceState(null, '', `/${id}`);
        setGuildId(id)
    }

    return (<div>
        {
            !loggedIn ?
                <a href={ process.env.REACT_APP_REDIRECT_LINK }><button>Discord Login</button></a>
            :
                <div>
                    <div class='guilds'>
                        { guilds.map(guild =>
                            <img class='guild_icon'
                                src={ guild.iconURL }
                                alt="icon" width="75" height="75"
                                title={ guild.name }
                                onClick={ () => guildIconClick(guild.id) }>
                            </img>
                        ) }
                    </div>
                </div>
        }
        { guildId ? <Guild guildId={ guildId }/> : <Home/> }
    </div>)
}

export default Main;