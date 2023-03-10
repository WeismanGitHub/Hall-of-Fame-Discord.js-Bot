function AuthorsPopup({ authors, setQuoteAuthorId, quoteAuthorId }) {
    function selectAuthor(id) {
        quoteAuthorId == id ? setQuoteAuthorId(null) : setQuoteAuthorId(id)
    }

    return (<>
        { authors.map(({ _id, iconURL, name }) => <div class='author'>
            <div class={ quoteAuthorId == _id ? 'highlighted' : 'unhighlighted'}>
                <div class='author_container' onClick={() => selectAuthor(_id)}>
                    <img
                        class='author_icon'
                        src={iconURL || "/icon.png"}
                        alt="author icon"
                        width = "45"
                        height = "45"
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src="/icon.png";
                        }}
                    />
                    <div class='author_name'>{name}</div>
                </div>
            </div>
            <br/>
        </div>) }
    </>)
}

export default AuthorsPopup;