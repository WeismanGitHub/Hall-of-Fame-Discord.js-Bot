import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import Cookies from 'js-cookie';

function Guild() {
    const home = { name: 'home', iconURL: '/icon.png' }
    const [loggedIn, setLoggedIn] = useState(Cookies.get('loggedIn'))
    const [guilds, setGuilds] = useState([home])
    const [displayGuild, setDisplayGuild] = useState(null)
    const [authors, setAuthors] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        const code = String(window.location).split('code=')[1]
        const guildId = 'get guildId from params somehow'

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
            
            guilds.forEach(guild => {
                if (guild.id == guildId) {
                    setDisplayGuild(guild)
                }
            })
        })

        if (!displayGuild) {
            navigate('/')
        }

        axios.get(`/api/v1/authors/${displayGuild.id}`).then(res => setAuthors(res.data))
    }, [])

    return (<div>
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
                <div class='main'>
                    { displayGuild.name }
                </div>
                <div class='authors'>
                    { authors.forEach(author => author.name)}
                </div>
            </div>
        }
    </div>)
}

export default Guild;