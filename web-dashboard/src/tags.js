function Tags({ tags, setQueryTags, queryTags }) {
    function tagClick(e, tag) {
        e.preventDefault();

        if (queryTags.includes(tag)) {
            setQueryTags(queryTags.filter(queryTag => tag !== queryTag))
        } else {
            const updatedQueryTags = [...queryTags, tag]

            if (updatedQueryTags.length > 3) {
                setQueryTags(updatedQueryTags.slice(1))
            } else {
                setQueryTags(updatedQueryTags)
            }
        }
    }

    return <div class='tags'>
        <div class='tags_header'>Tags - { tags.length }</div>
        <hr class="tags_divider"/>
        <br/>

        { tags.map(tag => <>
        <div class={ queryTags.includes(tag) ? 'highlighted' : 'unhighlighted'}>
            <div class='tag_container' onClick={ (e) => tagClick(e, tag) }>
                <div class='tag_text'>{ tag }</div>
            </div>
        </div>
        </>) }
    </div>
}

export default Tags;