import * as moment from 'moment-timezone';

function Quotes({ quotes, authors }) {
    if (!quotes.length || !quotes) {
        return <div class='no_quotes'>
            404: No Quotes
        </div>
    }

    return <div class='quotes'>
        { quotes.map(quote => {
            const author = authors.find(author => author._id == quote.authorId)
            const { type, attachmentURL, createdAt, text } = quote
            let tags = quote.tags.filter(x => x !== null)
            tags = tags.length ? tags.join(', ') : ['no tags']
            // #83D3AD #F79CCF #C487FF #F7BF8B
            
            if (type == 'regular') {
                return <>
                    <div className='quote_message'>
                        <div className="quote_author_avatar">
                            <img
                                src={ author?.iconURL || "/icon.png" }
                                alt="author icon"
                                width = "50"
                                height = "50"
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
                                <span className="quote_message_timestamp"> { moment(createdAt).calendar() } - { tags }</span>
                            </div>
                            <div className="quote_message_body">
                                { text }
                                { !attachmentURL ? null : <img
                                    class='quote_image'
                                    src={ attachmentURL }
                                    alt="invalid image"
                                />}
                            </div>
                        </div>
                    </div>
                </>
            }
        }) }
    </div>
}

export default Quotes;