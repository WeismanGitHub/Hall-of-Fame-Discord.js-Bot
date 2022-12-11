import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import Cookies from 'js-cookie';
import Guild from './guild'

function Home() {
    return <h1>home</h1>
    // const guildId = 'get guildId from params somehow'
    // const home = { name: 'home', iconURL: '/icon.png' }
    // const [loggedIn, setLoggedIn] = useState(false)
    // const [guilds, setGuilds] = useState([home])
    // const [state, setState] = useState(home)

    // useEffect(() => {
    //     const code = String(window.location).split('code=')[1]
    //     const guildId = window.location.href.match('[^\/]+$')[0]

    //     if (Cookies.get('loggedIn')) {
    //         return axios.get('/api/v1/guilds').then(res => {
    //             setLoggedIn(true)
    //             setGuilds(guilds.concat(res.data))
                
    //             guilds.forEach(guild => {
    //                 if (guild.id == guildId) {
    //                     setState(guild)
    //                 }
    //             })
    //         })
    //     }
        
    //     if (code) {
    //         axios.post('/api/v1/auth', { code: code })
    //         .then(res => axios.get('/api/v1/guilds')).then(res => setGuilds(guilds.concat(res.data))).catch(err => setLoggedIn(false))
    //     }
    // }, [])

    // function onGuildClick(guild) {
    //     window.location.href += guild.id
    //     setState(guild)
    // }
    
    // const Home = (<div class='guilds'>
    //     { guilds.map(guild => {
    //         return <img onClick={() => onGuildClick(guild)} class='guild_icon' src={guild.iconURL} alt="img" width="75" height="75" title={`${guild.name}`}></img>
    //     }) }

    //     { state !== home ? <Guild guild={ state }/> : <div class='guild'><h1>Home</h1></div> }
    // </div>)

    // return (<div>
    //     {
    //         !loggedIn ? <a href={ process.env.REACT_APP_REDIRECT_LINK }>
    //             <button>Login to Discord</button>
    //         </a> : Home
    //     }
    // </div>)
}

export default Home;