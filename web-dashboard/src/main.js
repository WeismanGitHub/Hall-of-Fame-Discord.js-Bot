import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import Cookies from 'js-cookie';

import View from './view'
import Login from './login'

function Main() {
    const [loggedIn, setLoggedIn] = useState(Cookies.get('loggedIn'))
    const createQuote = { name: 'create quote', iconURL: '/create-quote.png', id: null }
    const [guilds, setGuilds] = useState([createQuote])
    const [guildId, setGuildId] = useState(null)
    const navigate = useNavigate()

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
                            { guilds.map(guild => <div>
                                <img class={ guildId == guild.id ? 'chosen_guild' : 'unchosen_guild'}
                                    src={ guild.iconURL }
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
                    <View guildId={ guildId } setGuildId={ setGuildId } guildName={ guilds.find((guild) => guild.id == guildId).name }/>
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