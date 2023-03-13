function FragmentsPopup({ authors, setQuoteFragments, quoteFragments }) {
    function deleteFragment() {
        console.log('delete fragment')
    }

    function createFragment() {
        console.log('new fragment')
    }

    function changeAuthor() {
        console.log('change author')
    }

    return (<>
        <div className="quote_message_body">
            { quoteFragments.map(({ authorId, text })=> {
                const author = authors.find(author => author._id == authorId)

                return <div className='quote_message' style={{'background-color': '#292c30'}}>
                    <div style={{width: '100px', padding: '5px'}}>
                        <button
                            style={{padding: '5px'}}
                            class='modal_submit'
                            onClick={()=> changeAuthor({ authorId, text })}
                        >
                            Author
                        </button>
                        <button
                            class='modal_submit'
                            onClick={()=> deleteFragment({ authorId, text })}
                            style={{padding: '5px', 'margin-top': '3px'}}
                        >
                            Delete
                        </button>
                    </div>

                    <div className="quote_author_avatar">
                        <img
                            src={ author?.iconURL || "/icon.png" }
                            alt="author icon"
                            width = "40"
                            height = "40"
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src="/icon.png";
                            }}
                        />
                    </div>
                    <div className="quote_message_content">
                        <div>
                            <span className="quote_author_info">
                                <span className="quote_author_username">{ author?.name || 'Deleted Author' }</span>
                            </span>
                        </div>

                        <div className="quote_message_body" style={{padding: '3px'}}>
                            <input
                                type="text"
                                class='edit_author_name'
                                value={text}
                                onChange={ (e)=> console.log(e.target.value) }
                                autoFocus
                            />
                        </div>
                    </div>
                </div>
            })}
        </div>

        <div class='centered_row'>
            <button class='modal_submit' onClick={createFragment} style={{ 'margin-bottom': '50px' }}>New Fragment</button>
        </div>
    </>)
}

export default FragmentsPopup;