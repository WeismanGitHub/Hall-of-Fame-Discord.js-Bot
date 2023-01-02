import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import Cookies from 'js-cookie';

import Guild from './guild'

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
        })
    }, [])
    
    function guildIconClick(id) {
        setGuildId(id)
    }

    return (<>
        <body>
            {
                !loggedIn ?
                    <a href={ process.env.REACT_APP_REDIRECT_LINK }><button>Discord Login</button></a>
                :
                    <div>
                        <div class='guilds'>
                            { guilds.map(guild => 
                                <div>
                                    <img class='guild_icon'
                                        src={ guild.iconURL }
                                        alt="icon"
                                        width = "60"
                                        height = "60"
                                        title = { guild.name }
                                        onClick={ () => guildIconClick(guild.id) }>
                                    </img>
                                    
                                    { !guilds.indexOf(guild) && <hr class="guilds_divider"/>}
                                </div>)
                            }
                        </div>
                </div>
            }

            { <Guild guildId={ guildId } setGuildId={ setGuildId }/> }
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