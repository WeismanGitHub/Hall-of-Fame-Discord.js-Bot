import { useNavigate, useParams } from 'react-router-dom';
import GuildsSideBar from './guilds-sidebar';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'

function Guild() {
    const [authors, setAuthors] = useState([])
    const navigate = useNavigate();
    const { guildId } = useParams()

    useEffect(() => {
        if (!guildId) {
            navigate('/')
        }

        axios.get(`/api/v1/authors/${guildId}`).then(res => setAuthors(res.data))
    }, [])

    return (<div>
        <GuildsSideBar/>
        <div class='authors'>
            { authors.forEach(author => author.name) }
        </div>
    </div>)
}

export default Guild;