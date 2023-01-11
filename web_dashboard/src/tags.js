function Tags({ tags, setQueryTags, queryTags }) {
    function tagClick(e, tag) {
        e.preventDefault();

        if (queryTags.includes(tag)) {
            setQueryTags(queryTags.filter(queryTag => tag !== queryTag))
        } else {
            setQueryTags([...queryTags, tag])

            if (queryTags.length >= 3) {
                setQueryTags(queryTags.slice(1))
            }
        }
    }

    return <div class='tags'>
        <div class='tags_header'>Tags - { tags.length }</div>
        <hr class="tags_divider"/>
        <br/>

        { tags.map(tag => <div class={ queryTags.includes(tag) ? 'highlighted' : 'unhighlighted'}>
            <div class='tag' onClick={ (e) => tagClick(e, tag) }>{ tag }</div>
            <br class='tag_br'/>
        </div>) }
    </div>
}

export default Tags;