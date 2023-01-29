function Authors({ authors, setQueryAuthorId, queryAuthorId }) {
    function authorClick(id) {
        queryAuthorId == id ? setQueryAuthorId(null) : setQueryAuthorId(id)
    }

    return <div class='authors'>
        <div class='authors_header'>Authors - { authors.length }</div>
        <hr class="authors_divider"/>
        <br/>
        { authors.map(author => <div class='author'>
            <div class={ queryAuthorId == author._id ? 'highlighted' : 'unhighlighted'}>
                <div class='author_container' onClick={ () => authorClick(author._id) }>
                    <img
                        class='author_icon'
                        src={ author?.iconURL || "/icon.png" }
                        alt="author icon"
                        width = "45"
                        height = "45"
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src="/icon.png";
                        }}
                    />
                    <div class='author_name'>{ author.name }</div>
                </div>
            </div>
            <br/>
        </div>) }
    </div>
}

export default Authors;