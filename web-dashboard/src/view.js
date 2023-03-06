import { errorToast, regularToast } from './toasts'
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'

import SearchArea from './view/search-area'
import Authors from './view/authors'
import Quotes from './view/quotes'
import Home from './view/home'
import Tags from './view/tags'

function View({ guildId, guildName }) {
    const [authors, setAuthors] = useState([])
    const [quotes, setQuotes] = useState([])
    const [tags, setTags] = useState([])

    const [queryAuthorId, setQueryAuthorId] = useState(null)
    const [queryAge, setQueryAge] = useState('new')
    const [queryType, setQueryType] = useState(null)
    const [queryText, setQueryText] = useState(null)
    const [queryTags, setQueryTags] = useState([])
    const [queryPage, setQueryPage] = useState(0)
    const [countClick, setCountClick] = useState(false)

    useEffect(() => {
        setQueryPage(0)
    }, [queryAuthorId, queryType, queryText, queryTags, queryAge])

    useEffect(() => {
        if (countClick) {
            axios.get(`/api/v1/${guildId}/quotes/count`, { params: {
                authorId: queryAuthorId,
                tags: queryTags,
                text: queryText,
                type: queryType,
            } })
            .then(res => {
                regularToast(res.data.amount)
                setCountClick(false)
            })
        }
    }, [countClick])

    useEffect(() => {
        setQueryAuthorId(null)
        setQueryAge('new')
        setQueryType(null)
        setQueryText(null)
        setQueryTags([])
        setQueryPage(0)
        setAuthors([])
        setQuotes([])
        setTags([])
        
        if (!guildId) {
            return
        }

        axios.get(`/api/v1/${guildId}/authors`)
        .then(res => {
            const sortedAuthors = res.data.sort((firstAuthor, secondAuthor) =>
                firstAuthor.name.localeCompare(secondAuthor.name, undefined, { sensitivity: 'base' })
            )

            setAuthors(sortedAuthors)

            axios.get(`/api/v1/${guildId}/quotes`)
            .then(res => setQuotes(res.data))

            axios.get(`/api/v1/${guildId}/tags`)
            .then(res => {
                const sortedTags = res.data.sort((firstTag, secondTag) =>
                    firstTag.localeCompare(secondTag, undefined, { sensitivity: 'base' })
                )
    
                setTags(sortedTags)
            })
        }).catch(err => {
            errorToast(err.message || "There's been an error.")
        })
    }, [guildId])

    if (!guildId) {
        return <Home/>
    }

    function search() {
        axios.get(`/api/v1/${guildId}/quotes`, { params: {
            authorId: queryAuthorId,
            tags: queryTags,
            text: queryText,
            type: queryType,
            page: queryPage,
            age: queryAge
        } })
        .then(res => setQuotes(res.data))
    }

    function loadMoreQuotes() {
        axios.get(`/api/v1/${guildId}/quotes`, { params: {
            authorId: queryAuthorId,
            tags: queryTags,
            text: queryText,
            type: queryType,
            page: queryPage + 1, // + 1 because of a bug. idk
            age: queryAge
        } })
        .then(res => setQuotes([...quotes, ...res.data]))
    }

    return (<>
        <Tags
            tags={tags}
            queryTags={queryTags}
            setQueryTags={setQueryTags}
            setTags={setTags}
            guildId={guildId}
        />

        <div class='center'>
            <div class='header'><div class='server_name'>{guildName}</div></div>

            <Quotes
                loadMoreQuotes={loadMoreQuotes}
                quotes={quotes}
                authors={authors}
                queryPage={queryPage}
                setQueryPage={setQueryPage}
                setQuotes={setQuotes}
                guildId={guildId}
            />

            <SearchArea
                setQueryType={setQueryType}
                setQueryAge={setQueryAge}
                setQueryText={setQueryText}
                queryType={queryType}
                queryAge={queryAge}
                queryText={queryText}
                search={search}
                setCountClick={setCountClick}
            />
        </div>

        <Authors
            authors={authors}
            setQueryAuthorId={setQueryAuthorId}
            queryAuthorId={queryAuthorId}
            guildId={guildId}
            setAuthors={setAuthors}
        />
    </>)
}

export default View;