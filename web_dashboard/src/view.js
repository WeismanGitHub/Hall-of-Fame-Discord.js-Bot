import { useState, useEffect } from 'react';
import { toast } from 'react-toastify'
import axios, * as others from 'axios'

import CreateQuote from './create-quote'
import Authors from './authors'

function View({ guildId, setGuildId }) {
    const [authors, setAuthors] = useState([])
    const [quotes, setQuotes] = useState([])
    const [tags, setTags] = useState([])

    const [queryAuthorId, setQueryAuthorId] = useState(null)
    const [queryTags, setQueryTags] = useState([])
    const [queryType, setQueryType] = useState(null)
    const [queryText, setQueryText] = useState(null)
    const [queryDate, setQueryDate] = useState(-1)
    const [queryPage, setQueryPage] = useState(0)
    
    useEffect(() => {
        if (!guildId) {
            setQueryAuthorId(null)
            setQueryType(null)
            setQueryText(null)
            setQueryDate(-1)
            setGuildId(null)
            setQueryTags([])
            setQueryPage(0)
            setAuthors([])
            setQuotes([])
            setTags([])
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

            axios.get('/api/v1/quotes/' + guildId)
            .then(res => setQuotes(res.data))
        } catch(err) {
            setQueryAuthorId(null)
            setGuildId(null)
            setQueryDate(-1)
            setQueryType(null)
            setQueryTags([])
            setQueryText(null)
            setQueryPage(0)
            setAuthors([])
            setQuotes([])
            setTags([])

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
        axios.get('/api/v1/quotes/' + guildId, { params: {
            authorId: queryAuthorId,
            tags: queryTags,
            text: queryText,
            type: queryType,
            page: queryPage,
            date: queryDate
        } })
        .then(res => setQuotes(res.data))
    }

    function tagClick(tag) {
        setQueryTags(queryTags.slice(1).push(tag))
    }

    return (<div>
        <div class='tags'>
            <div class='tags_header'>Tags - { tags.length }</div>
            <hr class="tags_divider"/>
            <br/>

            { tags.map(tag => <>
                <div class='tag' onClick={ () => tagClick(tag) }>{ tag }</div>
                <br class='tag_br'/>
            </>) }
        </div>

        <Authors authors={ authors } setQueryAuthorId={ setQueryAuthorId } queryAuthorId={ queryAuthorId }/>

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

export default View;