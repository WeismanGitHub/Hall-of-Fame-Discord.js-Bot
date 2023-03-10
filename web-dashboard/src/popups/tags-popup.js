function TagsPopup({ tags, setQuoteTags, quoteTags }) {
    function tagClick(e, tag) {
        e.preventDefault();

        if (quoteTags.includes(tag)) {
            return setQuoteTags(quoteTags.filter(quoteTag => tag !== quoteTag))
        }

        const updatedQuoteTags = [...quoteTags, tag]

        if (updatedQuoteTags.length > 3) {
            setQuoteTags(updatedQuoteTags.slice(1))
        } else {
            setQuoteTags(updatedQuoteTags)
        }
    }

    return (<>
        {
            tags.map(tag => <>
            <div class={ quoteTags.includes(tag) ? 'highlighted' : 'unhighlighted'}>
                <div class='tag_container' onClick={ (e) => tagClick(e, tag) }>
                    <div class='tag_text'>{ tag }</div>
                </div>
            </div>
            </>)
        }
    </>)
}

export default TagsPopup;