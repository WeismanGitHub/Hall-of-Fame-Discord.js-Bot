import { useEffect, } from 'react';
import { useParams } from 'react-router-dom';
import GuildsSideBar from './guilds-sidebar';
import Guild from './guild'
import Home from './home'

function Main() {
    const { guildId } = useParams()

    useEffect(() => {
    }, [])

    return (<div>
        <GuildsSideBar/>
        { guildId ? <Guild guildId={ guildId }/> : <Home/> }
    </div>)
}

export default Main;