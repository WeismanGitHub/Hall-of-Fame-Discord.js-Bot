function DisplayQuote() {
    // const author = authors.find(author => author._id == quote.authorId)
    // const { type, attachmentURL, createdAt, text, audioURL, fragments, _id } = quote
    // const filteredTags = quote.tags.filter(x => x !== null)
    // const tags = quoteTags.length ? quoteTags.join(', ') : ['no tags']
    // let color;

    // switch(type) {
    //     case 'regular':
    //         color = '#8F00FF'
    //         break
    //     case 'audio':
    //         color = '#00A64A'
    //         break
    //     case 'multi':
    //         color = '#ff2e95'
    //         break
    // }
    
    // color = attachmentURL ? '#FF7B00' : color
    
    // if (type !== 'multi') {
    //     return <>
    //         <div className='quote_message'
    //         style={{ 'border-left': `4px solid ${color}` }}
    //         onContextMenu={(e) => handleContextMenu(e, quote)}>
    //             <div className="quote_author_avatar">
    //                 <img
    //                     src={ author?.iconURL || "/icon.png" }
    //                     alt="author icon"
    //                     width = "50"
    //                     height = "50"
    //                     onError={({ currentTarget }) => {
    //                         currentTarget.onerror = null; // prevents looping
    //                         currentTarget.src="/icon.png";
    //                     }}
    //                 />
    //             </div>
    //             <div className="quote_message_content">
    //                 <div>
    //                     <span className="quote_author_info">
    //                         <span className="quote_author_username">{ author?.name || 'Deleted Author' }</span>
    //                     </span>
    //                     <span className="quote_message_timestamp">
    //                         { moment(createdAt).calendar() } - { tags }
    //                     </span>
    //                 </div>

    //                 <div className="quote_message_body">
    //                     { text }
                        
    //                     { !audioURL ? null : <AudioPlayer
    //                         src={audioURL}
    //                         showJumpControls={false}
    //                         showSkipControls={false}
    //                         autoPlayAfterSrcChange={false}
    //                         hasDefaultKeyBindings={false}
    //                         showFilledProgress={true}
    //                         layout={'horizontal'}
    //                         customVolumeControls={[]}
    //                     /> }

    //                     { !attachmentURL ? null : <img
    //                         class='quote_image'
    //                         src={ attachmentURL }
    //                         alt="invalid image"
    //                     />}
    //                 </div>
    //             </div>
    //         </div>
    //         <Menu id={quoteContextId} theme="dark">
    //             <Item id="edit" onClick={handleItemClick}>Edit</Item>
    //             <Item id="delete" onClick={handleItemClick}>Delete</Item>
    //         </Menu>
    //     </>
    // } else {
    //     return <>
    //         <div className='quote_message'
    //         style={{ 'border-left': `4px solid ${color}` }}
    //         onContextMenu={(e) => handleContextMenu(e, { id: _id })}>
    //             <div className="quote_message_content">
    //                 <div>
    //                     <span className="quote_author_info" style={{ 'margin-left': '10px' }}>
    //                         <span className="quote_author_username">{ text }</span>
    //                     </span>
    //                     <span className="quote_message_timestamp">
    //                         { moment(createdAt).calendar() } - { tags }
    //                     </span>
    //                 </div>
    //                 <div className="quote_message_body">
    //                     { fragments.map(({ authorId, text })=> {
    //                         const author = authors.find(author => author._id == authorId)

    //                         return <div className='quote_message'>
    //                             <div className="quote_author_avatar">
    //                                 <img
    //                                     src={ author?.iconURL || "/icon.png" }
    //                                     alt="author icon"
    //                                     width = "40"
    //                                     height = "40"
    //                                     onError={({ currentTarget }) => {
    //                                         currentTarget.onerror = null; // prevents looping
    //                                         currentTarget.src="/icon.png";
    //                                     }}
    //                                 />
    //                             </div>
    //                             <div className="quote_message_content">
    //                                 <div>
    //                                     <span className="quote_author_info">
    //                                         <span className="quote_author_username">{ author?.name || 'Deleted Author' }</span>
    //                                     </span>
    //                                 </div>

    //                                 <div className="quote_message_body">
    //                                     { text }
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     })}

    //                     { !attachmentURL ? null : <img
    //                         class='quote_image'
    //                         src={ attachmentURL }
    //                         alt="invalid image"
    //                     />}
    //                 </div>
    //             </div>
    //         </div>
    //     </>
    // }
}

export default DisplayQuote;