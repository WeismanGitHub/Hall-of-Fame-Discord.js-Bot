import InfiniteScroll from "react-infinite-scroller";
import * as moment from 'moment-timezone';

function Quotes({ search, quotes, authors, queryPage, setQueryPage }) {
    if (!quotes.length || !quotes) {
        return <div class='no_quotes'>
            404: No Quotes
        </div>
    }

    function fetchQuotes() {
        setQueryPage(queryPage + 1)
        search()
    }

    return <div class='quotes'>
        <InfiniteScroll
            pageStart={ queryPage }
            loadMore={ fetchQuotes }
            hasMore={ quotes.length == (queryPage + 1) * 10 }
            loader={ <h4 style={{ 'text-align': 'center' }}>Loading...</h4> }
            onEnded={ <p style={{ 'text-align': 'center' }}><b>End of the line!</b></p> }
            useWindow={ false }
        >
            { quotes.map(quote => {
                const author = authors.find(author => author._id == quote.authorId)
                const { type, attachmentURL, createdAt, text } = quote
                let tags = quote.tags.filter(x => x !== null)
                tags = tags.length ? tags.join(', ') : ['no tags']
                // #ff2e95 #00A64A
                
                if (type == 'regular') {
                    const color = attachmentURL ? '#FF7B00' : '#8F00FF'

                    return <>
                        <div className='quote_message' style={{ 'border-left': `4px solid ${color}` }}>
                            <div style={{ background: color }} className="discord-left-border"></div>
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
                                    <span className="quote_message_timestamp">
                                        { moment(createdAt).calendar() } - { tags }
                                    </span>
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
        </InfiniteScroll>
    </div>
}

export default Quotes;