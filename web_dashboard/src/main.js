import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import Cookies from 'js-cookie';

import Guild from './guild'
import Login from './login'

function Main() {
    const [loggedIn, setLoggedIn] = useState(Cookies.get('loggedIn'))
    const createQuote = { name: 'create quote', iconURL: '/create-quote.png', id: null }
    const [guilds, setGuilds] = useState([createQuote])
    const [guildId, setGuildId] = useState(null)
    const navigate = useNavigate()

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
        }).catch(err => setLoggedIn(false))
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
                            { guilds.map(guild => 
                                <div>
                                    <img class='guild_icon'
                                        src={ guild.iconURL }
                                        alt="server icon"
                                        width = "60"
                                        height = "60"
                                        title = { guild.name }
                                        onClick={ () => guildIconClick(guild.id) }>
                                    </img>
                                    
                                    { !guilds.indexOf(guild) && <hr class="guilds_divider"/>}
                                </div>)
                            }
                            
                            <a href="https://github.com/WeismanGitHub/Hall-of-Fame-Discord.js-Bot#readme">
                                <img class='guild_icon'
                                    src='/question-mark.png'
                                    alt="readme button"
                                    width = "70"
                                    height = "70"
                                    title = 'readme'
                                />
                            </a>
                            <img class='guild_icon'
                                src='/logout.png'
                                alt="logout button"
                                width = "70"
                                height = "70"
                                title = 'logout'
                                onClick={ logout }>
                            </img>
                        </div>
                    <Guild guildId={ guildId } setGuildId={ setGuildId }/>
                </div>
            }
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