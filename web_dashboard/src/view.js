import { useState, useEffect } from 'react';
import { toast } from 'react-toastify'
import axios, * as others from 'axios'
import CreateQuote from './create-quote'

function View({ guildId, setGuildId }) {
    const [authors, setAuthors] = useState([])
    const [quotes, setQuotes] = useState([])
    const [tags, setTags] = useState([])

    const [queryTags, setQueryTags] = useState([])
    const [queryAuthorId, setQueryAuthorId] = useState('')
    const [queryType, setQueryType] = useState('')
    const [queryText, setQueryText] = useState('')
    const [queryDate, setQueryDate] = useState(-1)
    const [queryPage, setQueryPage] = useState(0)
    
    useEffect(() => {
        if (!guildId) {
            throw new Error('No Guild Id')
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
            setQueryAuthorId('')
            setGuildId(null)
            setQueryDate(-1)
            setQueryType('')
            setQueryTags([])
            setQueryText('')
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

    function authorClick(id) {
        setQueryAuthorId(id)
    }

    console.log(quotes)
    
    return (<div>
        <div class='tags'>
            <div class='tags_header'>Tags - { tags.length }</div>
            <hr class="tags_divider"/>
            <br/>

            { tags.map(tag => <><div class='tag'>{ tag }</div><br class='tag_br'/></>) }
        </div>

        <div class='authors'>
            <div class='authors_header'>Authors - { authors.length }</div>
            <hr class="authors_divider"/>
            <br/>

            { authors.map(author => <div class='author'>
                <div class='author_container' onClick={ () => authorClick(author._id) }>
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
                </div>
                <br/>
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

export default View;