import { useState, useEffect } from 'react';
import { toast } from 'react-toastify'
import axios, * as others from 'axios'

import CreateQuote from './create-quote'
import Authors from './authors'
import Quotes from './quotes'
import Tags from './tags'

function View({ guildId, setGuildId, guildName }) {
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
        search()
    }, [queryPage])

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

    return (<div>
        <Tags tags={ tags } queryTags={ queryTags } setQueryTags={ setQueryTags }/>
        <Authors authors={ authors } setQueryAuthorId={ setQueryAuthorId } queryAuthorId={ queryAuthorId }/>

        <div class='center'>
            <div class='header'>
                <div class='back_button'>
                    <img
                        class={ queryPage <= 0 ? 'unclickable' : 'clickable' }
                        src='/left-arrow.png'
                        alt="back button"
                        width = "30"
                        height = "30"
                        title = 'back'
                        onClick={ () => {
                            if (queryPage > 0) setQueryPage(queryPage - 1)
                        } }
                    />
                </div>

                <div class='server_name'>{ guildName }</div>

                <div class='next_button'>
                    <img
                        class={ quotes.length < 20 ? 'unclickable' : 'clickable' }
                        src='/right-arrow.png'
                        alt="next button"
                        width = "30"
                        height = "30"
                        title = 'next'
                        onClick={ () => {
                            if (quotes.length == 20) setQueryPage(queryPage + 1)
                        } }
                    />
                </div>
            </div>

            <Quotes quotes={ quotes } authors={ authors }/>

            <div class='footer'>
                <img
                    class='search_icon'
                    src='/search.png'
                    alt="search icon"
                    width = "45"
                    height = "45"
                    title = 'search'
                    onClick={ search }
                />
                
                <input 
                    type="text"
                    class='text_search_bar'
                    value={ queryText }
                    placeholder="search text..."
                    onChange={ (e)=> setQueryText(e.target.value) }
                    onKeyPress={ (event) => { event.key === 'Enter' && search() } }
                />
            </div>
        </div>
    </div>)
}

export default View;