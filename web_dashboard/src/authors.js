function Authors({ authors, setQueryAuthorId, queryAuthorId }) {
    function authorClick(id) {
        console.log(id)
        queryAuthorId == id ? setQueryAuthorId(null) : setQueryAuthorId(id)
    }

    console.log(queryAuthorId)
    return <div class='authors'>
        <div class='authors_header'>Authors - { authors.length }</div>
        <hr class="authors_divider"/>
        <br/>
        { authors.map(author => <div class='author'>
            <div class={ queryAuthorId == author._id ? 'highlighted' : 'unhighlighted'}>
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
            </div>
            <br/>
        </div>) }
    </div>
}

export default Authors;