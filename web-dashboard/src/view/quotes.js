import { Menu, Item, useContextMenu } from 'react-contexify';
import InfiniteScroll from "react-infinite-scroller";
import { successToast, errorToast } from '../toasts';
import AudioPlayer from 'react-h5-audio-player';
import 'react-contexify/ReactContexify.css';
import * as moment from 'moment-timezone';
import axios, * as others from 'axios'
import 'reactjs-popup/dist/index.css'
import Popup from 'reactjs-popup';
import { useState } from 'react';

import EditQuote from '../edit/edit-quote'

function Quotes({ loadMoreQuotes, quotes, authors, queryPage, setQueryPage, guildId, setQuotes, tags}) {
    const contentStyle = { background: '#2f3136', border: "#232428 2px solid", 'border-radius': '5px' }
    const [quoteBeingEdited, setQuoteBeingEdited] = useState(null)
    const [showPopup, setShowPopup] = useState(false)
    const quoteContextId = 'quote_id'

    const { show } = useContextMenu({
        id: quoteContextId
    });

    if (!quotes?.length || !quotes) {
        return <div class='no_quotes'>
            404: No Quotes
        </div>
    }

    function fetchQuotes() {
        setQueryPage(queryPage + 1)
        loadMoreQuotes()
    }

    function handleContextMenu(event, props) {
        show({ event, props })
    }

    const handleItemClick = ({ id, props }) => {
        switch (id) {
        case "edit":
            setShowPopup(true)
            setQuoteBeingEdited(props)
            break;
        case "delete":
            if (!window.confirm(`Delete quote?`)) {
                break
            }

            axios.delete(`/api/v1/${guildId}/quotes/${props._id}`)
            .then(res => {
                successToast(`Successfully deleted quote.`)
                setQuotes(quotes.filter(quote => quote._id !== props._id))
            }).catch(err => {
                errorToast(`Failed to delete quote.`)
            })
            break;
        }
    }

    return <>
        <div class='quotes'>
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
                    const { type, attachmentURL, createdAt, text, audioURL, fragments, _id } = quote
                    const filteredTags = quote.tags.filter(x => x !== null)
                    const tags = filteredTags.length ? filteredTags.join(', ') : ['no tags']
                    let color;

                    switch(type) {
                        case 'regular':
                            color = '#8F00FF'
                            break
                        case 'audio':
                            color = '#00A64A'
                            break
                        case 'multi':
                            color = '#ff2e95'
                            break
                    }
                    
                    color = attachmentURL ? '#FF7B00' : color
                    
                    if (type !== 'multi') {
                            return <>
                                <div className='quote_message'
                                style={{ 'border-left': `4px solid ${color}` }}
                                onContextMenu={(e) => handleContextMenu(e, quote)}>
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
                                <Menu id={quoteContextId} theme="dark">
                                    <Item id="edit" onClick={handleItemClick}>Edit</Item>
                                    <Item id="delete" onClick={handleItemClick}>Delete</Item>
                                </Menu>
                            </>
                    } else {
                        return <>
                            <div className='quote_message'
                            style={{ 'border-left': `4px solid ${color}` }}
                            onContextMenu={(e) => handleContextMenu(e, { id: _id })}>
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

                                                    <div className="quote_message_body">
                                                        { text }
                                                    </div>
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
                            <Menu id={quoteContextId} theme="dark">
                                <Item id="edit" onClick={handleItemClick}>Edit</Item>
                                <Item id="delete" onClick={handleItemClick}>Delete</Item>
                            </Menu>
                        </>
                    }
                })}
            </InfiniteScroll>
        </div>
        <Popup
            open={showPopup}
            position="center center"
            modal onClose={() => setShowPopup(false)}
            {...{ contentStyle }}
            nested
        >
            <EditQuote
                setQuoteBeingEdited={setQuoteBeingEdited}
                quoteBeingEdited={quoteBeingEdited}
                setQuotes={setQuotes}
                guildId={guildId}
                quotes={quotes}
                authors={authors}
                tags={tags}
                />
        </Popup>
    </>
}

export default Quotes;