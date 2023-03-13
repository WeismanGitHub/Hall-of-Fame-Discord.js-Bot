function FragmentsPopup({ authors, setQuoteFragments, quoteFragments }) {
    console.log(quoteFragments)

    return (<>
        <div className="quote_message_body">
            { quoteFragments.map(({ authorId, text })=> {
                const author = authors.find(author => author._id == authorId)

                return <div className='quote_message' style={{'background-color': '#292c30'}}>
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

                        <div className="quote_message_body">
                            <input
                                type="text"
                                class='edit_author_name'
                                // style={{ width: '550px' }}
                                value={text}
                                onChange={ (e)=> console.log(e.target.value) }
                                autoFocus
                            />
                        </div>
                    </div>
                </div>
            })}
        </div>
    </>)
}

export default FragmentsPopup;