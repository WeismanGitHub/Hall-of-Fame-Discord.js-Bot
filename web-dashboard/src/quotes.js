import InfiniteScroll from "react-infinite-scroller";
import AudioPlayer from 'react-h5-audio-player';
import * as moment from 'moment-timezone';

function Quotes({ loadMoreQuotes, quotes, authors, queryPage, setQueryPage }) {
    if (!quotes.length || !quotes) {
        return <div class='no_quotes'>
            404: No Quotes
        </div>
    }

    function fetchQuotes() {
        setQueryPage(queryPage + 1)
        loadMoreQuotes()
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
                const { type, attachmentURL, createdAt, text, audioURL, fragments } = quote
                const filteredTags = quote.tags.filter(x => x !== null)
                const tags = filteredTags.length ? filteredTags.join(', ') : ['no tags']
                let color;

                switch(type) {
                    case 'regular':
                        color = attachmentURL ? '#FF7B00' : '#8F00FF'
                        break
                    case 'audio':
                        color = '#00A64A'
                        break
                    case 'multi':
                        color = '#ff2e95'
                        break
                }
                
                if (type !== 'multi') {
                        return <div className='quote_message' style={{ 'border-left': `4px solid ${color}` }}>
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
                                    
                                    { !audioURL ? null : <AudioPlayer
                                        src={audioURL}
                                        showJumpControls={false}
                                        showSkipControls={false}
                                        autoPlayAfterSrcChange={false}
                                        hasDefaultKeyBindings={false}
                                        showFilledProgress={true}
                                        layout={'horizontal'}
                                        customVolumeControls={[]}
                                    /> }

                                    { !attachmentURL ? null : <img
                                        class='quote_image'
                                        src={ attachmentURL }
                                        alt="invalid image"
                                    />}
                                </div>
                            </div>
                        </div>
                } else {
                    return <div className='quote_message' style={{ 'border-left': `4px solid ${color}` }}>
                        <div className="quote_message_content">
                            <div>
                                <span className="quote_author_info" style={{ 'margin-left': '10px' }}>
                                    <span className="quote_author_username">{ text }</span>
                                </span>
                                <span className="quote_message_timestamp">
                                    { moment(createdAt).calendar() } - { tags }
                                </span>
                            </div>
                            <div className="quote_message_body">
                                { fragments.map(({ authorId, text })=> {
                                    const author = authors.find(author => author._id == authorId)

                                    return <div className='quote_message'>
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

                                            <div className="quote_message_body">{ text }</div>
                                        </div>
                                    </div>
                                })}

                                { !attachmentURL ? null : <img
                                    class='quote_image'
                                    src={ attachmentURL }
                                    alt="invalid image"
                                />}
                            </div>
                        </div>
                    </div>
                }
            })}
        </InfiniteScroll>
    </div>
}

export default Quotes;