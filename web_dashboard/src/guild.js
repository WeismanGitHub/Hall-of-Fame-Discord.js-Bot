import { useState, useEffect } from 'react';
import { toast } from 'react-toastify'
import axios, * as others from 'axios'
import CreateQuote from './create-quote'

function Guild({ guildId, setGuildId }) {
    const [authors, setAuthors] = useState([])
    const [filter, setFilter] = useState({ guildId: guildId })
    const [quotes, setQuotes] = useState([])
    const [tags, setTags] = useState([])
    
    useEffect(() => {
        if (!guildId) {
            setAuthors([])
            setTags([])
            setFilter({ guildId: guildId })
            return
        }
        
        try {
            axios.get(`/api/v1/authors/${guildId}`)
            .then(res => {
                const sortedAuthors = res.data.sort((firstAuthor, secondAuthor) =>
                    firstAuthor.name.localeCompare(secondAuthor.name, undefined, { sensitivity: 'base' })
                )
    
                setAuthors(sortedAuthors)
            })

            axios.get(`/api/v1/tags/${guildId}`)
            .then(res => {
                const sortedTags = res.data.sort((firstTag, secondTag) =>
                firstTag.localeCompare(secondTag, undefined, { sensitivity: 'base' })
                )
    
                setTags(sortedTags)
            })
        } catch(err) {
            setGuildId(null)
            setAuthors([])
            setTags([])
            setFilter({})

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
        }
    }, [guildId])

    if (!guildId) {
        return <CreateQuote/>
    }

    function search() {
        axios.get('api/v1/search', filter)
        .then(res => {
            setQuotes(res.data)
        })
    }

    return (<div>
        <div class='tags'>
            <div class='tags_header'>Tags - { tags.length }</div>
            <hr class="tags_divider"/>
            <br/>

            { tags.map(tag => <><div class='tag'>{ tag }</div><br/></>) }
        </div>

        <div class='authors'>
            <div class='authors_header'>Authors - { authors.length }</div>
            <hr class="authors_divider"/>
            <br/>

            { authors.map(author => <div class='author'>
                <div class='author_container'>
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
                </div>
            </div>) }
        </div>

        <div class='center'>
            <img
                class='search_icon'
                src='/search.png'
                alt="search icon"
                width = "45"
                height = "45"
                title = 'search'
                onClick={ search }
            />
        </div>
    </div>)
}

export default Guild;