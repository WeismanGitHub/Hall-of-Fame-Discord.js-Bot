import { useState, useEffect } from 'react';
import { toast } from 'react-toastify'
import axios, * as others from 'axios'
import CreateQuote from './create-quote'

function Guild({ guildId, setGuildId }) {
    const [authors, setAuthors] = useState([])

    useEffect(() => {
        if (!guildId) {
            setAuthors([])
            return
        }
        
        axios.get(`/api/v1/authors/${guildId}`)
        .then(res => setAuthors(res.data))
        .catch(err => {
            setGuildId(null)
            setAuthors([])

            toast.error('Guild Not Found.Register with /register.', {
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
            <div class='authors_header'>Authors - { authors.length }</div>
            <hr class="authors_divider"/>
            <br/>

            { authors.map(author => <div class='author'>
                    <img
                        class='author_icon'
                        src={ author.iconURL }
                        alt="author icon"
                        width = "40"
                        height = "40"
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src="/icon.png";
                        }}
                    />
                    <div class='author_name'>{ author.name }</div>
                    <br/>
            </div>) }
        </div>
    </div>)
}

export default Guild;