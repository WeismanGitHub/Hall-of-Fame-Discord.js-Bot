import { useState, useEffect } from 'react';
import { toast } from 'react-toastify'
import axios, * as others from 'axios'
import CreateQuote from './create-quote'

function Guild({ guildId, setGuildId }) {
    const [authors, setAuthors] = useState([])

    useEffect(() => {
        if (!guildId) {
            return
        }
        
        axios.get(`/api/v1/authors/${guildId}`)
        .then(res => setAuthors(res.data))
        .catch(err => {
            setGuildId(null)

            toast.error('Guild Not Found.\nRegister with /register.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        })
    }, [guildId])

    if (!guildId) {
        return <CreateQuote/>
    }

    return (<div>
        <div class='authors'>
            { authors.map(author => <h1>{ author.name }</h1>) }
        </div>
    </div>)
}

export default Guild;