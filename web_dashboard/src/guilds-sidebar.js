import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import Cookies from 'js-cookie';

function GuildsSideBar() {
    const [loggedIn, setLoggedIn] = useState(Cookies.get('loggedIn'))
    const home = { name: 'home', iconURL: '/icon.png' }
    const [guilds, setGuilds] = useState([home])
    const navigate = useNavigate();
    const { guildId } = useParams()

    useEffect(() => {
        const code = String(window.location).split('code=')[1]

        if (code && !loggedIn) {
            axios.post('/api/v1/auth', { code: code })
            .then(res => setLoggedIn(true))
            .catch(err => setLoggedIn(false))
        }
        
        if (!loggedIn) {
            navigate('login')
        }

        axios.get('/api/v1/guilds').then(res => {
            setGuilds(guilds.concat(res.data))
        })
    }, [])

    return (<>
        {
            !loggedIn ? <a href={ process.env.REACT_APP_REDIRECT_LINK }>
                <button>Login to Discord</button>
            </a> : <div>
                <div class='guilds'>
                    {
                        guilds.map(guild => <a href={ `${guild.id}` }>
                        <img class='guild_icon' src={ guild.iconURL } alt="img" width="75" height="75" title={`${guild.name}`}></img>
                        </a>
                    ) }
                </div>
            </div>
        }
    </>)
}

export default GuildsSideBar