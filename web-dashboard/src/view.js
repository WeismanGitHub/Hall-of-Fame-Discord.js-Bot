import { useState, useEffect } from 'react';
import { toast } from 'react-toastify'
import axios, * as others from 'axios'

import CreateQuote from './create-quote'
import SearchArea from './search-area'
import Authors from './authors'
import Quotes from './quotes'
import Tags from './tags'

function View({ guildId, setGuildId, guildName }) {
    const [authors, setAuthors] = useState([])
    const [quotes, setQuotes] = useState([])
    const [tags, setTags] = useState([])

    const [queryAuthorId, setQueryAuthorId] = useState(null)
    const [queryType, setQueryType] = useState(null)
    const [queryText, setQueryText] = useState(null)
    const [queryTags, setQueryTags] = useState([])
    const [queryDate, setQueryDate] = useState('new')
    const [queryPage, setQueryPage] = useState(0)

    useEffect(() => {
        setQueryPage(0)
    }, [queryAuthorId, queryType, queryText, queryTags, queryDate])

    useEffect(() => {
        setQueryPage(0)
        
        if (!guildId) {
            setQueryAuthorId(null)
            setQueryType(null)
            setQueryText(null)
            setQueryDate('new')
            setGuildId(null)
            setQueryTags([])
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
            setQueryDate('new')
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

    function loadMoreQuotes() {
        axios.get('/api/v1/quotes/' + guildId, { params: {
            authorId: queryAuthorId,
            tags: queryTags,
            text: queryText,
            type: queryType,
            page: queryPage + 1, // + 1 because of a bug. idk
            date: queryDate
        } })
        .then(res => setQuotes([...quotes, ...res.data]))
    }

    return (<>
        <Tags tags={ tags } queryTags={ queryTags } setQueryTags={ setQueryTags }/>

        <div class='center'>
            <div class='header'><div class='server_name'>{ guildName }</div></div>

            <Quotes
                loadMoreQuotes={ loadMoreQuotes }
                quotes={ quotes }
                authors={ authors }
                queryPage={ queryPage }
                setQueryPage={ setQueryPage }
            />

            <SearchArea
                setQueryType={ setQueryType }
                setQueryDate={ setQueryDate }
                setQueryText={ setQueryText }
                queryType={ queryType }
                queryDate={ queryDate }
                queryText={ queryText }
                search={ search }
            />
        </div>

        <Authors authors={ authors } setQueryAuthorId={ setQueryAuthorId } queryAuthorId={ queryAuthorId }/>
    </>)
}

export default View;