import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import Cookies from 'js-cookie';
import Guild from './guild'

function Home() {
    const [loggedIn, setLoggedIn] = useState(false)
    const [guilds, setGuilds] = useState([{ name: 'home', iconURL: '/icon.png' }])
    const [state, setState] = useState('home')

    useEffect(() => {
        const code = String(window.location).split('code=')[1]
        setLoggedIn(code)

        if (Cookies.get('loggedIn')) {
            return axios.get('/api/v1/guilds').then(res => setGuilds(guilds.concat(res.data)))
        }
        
        if (code) {
            axios.post('/api/v1/auth', { code: code })
            .then(res => axios.get('/api/v1/guilds')).then(res => setGuilds(guilds.concat(res.data))).catch(err => setLoggedIn(false))
        }
    }, [])

    function onGuildClick()
    
    const Home = (<div>
        { guilds.map(guild => {
            return <a href={`${guild.id}`}><img class='guild_icon' src={guild.iconURL} alt="img" width="75" height="75" title={`${guild.name}`}></img></a>
        }) }

        { state !== 'home' ? <Guild guild={ guilds[state] }/> : <div class='guild'><h1>Home</h1></div> }
    </div>)

    return (<div>
        {
            !loggedIn ? <a href={ process.env.REACT_APP_REDIRECT_LINK }>
                <button>Login to Discord</button>
            </a> : Home
        }
    </div>)
}

export default Home;