import { successToast, errorToast } from '../toasts';
import axios, * as others from 'axios'
import { useState } from 'react';

function EditQuote({quoteBeingEdited, guildId, setQuotes, quotes, setQuoteBeingEdited, authors, tags}) {
    const [authorId, setAuthorId] = useState(quoteBeingEdited.authorId)
    const [quoteTags, setQuoteTags] = useState(quoteBeingEdited.tags)
    const [text, setText] = useState(quoteBeingEdited.text)
    const [removeImage, setRemoveImage] = useState(false)
    const [selectedFile, setSelectedFile] = useState()
    const [type, setType] = useState('regular')
    const quoteId = quoteBeingEdited._id
    
    function getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
    }

    function create() {
        const update = { removeImage }

        if (text !== quoteBeingEdited.text) {
            update.newText = text
        }
        
        if (selectedFile) {
            getBase64(selectedFile)
            .then(base64File => {
                axios.post(
                    'https://api.imgur.com/3/image/',
                    { image: base64File.split(',')[1] },
                    { headers: {
                        Authorization: `Client-ID ${process.env.REACT_APP_IMGUR_ID}`,
                        accept: "application/x-www-form-urlencoded"
                    } }
                ).then((res) => {
                    update.newAttachmentURL = res.data.data.link

                    axios.patch(`/api/v1/${guildId}/quotes/${quoteId}`, update)
                    .then(res => {
                        successToast(`Successfully edited quote.`)
                        const updatedQuote = {
                            text: text,
                            attachmentURL: res.data.data.link,
                            authorId: authorId,
                            tags: quoteTags,
                        }

                        setQuotes(quotes.map(quote => {
                            return quote == quoteBeingEdited ? updatedQuote : quote
                        }))

                        setQuoteBeingEdited(updatedQuote)
                    }).catch(err => {
                        errorToast(`Failed to edit quote.`)
                    })
                }).catch((err) => {
                    errorToast('Error uploading image.')
                });
            })

            return
        }

        axios.patch(`/api/v1/${guildId}/quotes/${quoteId}`, update)
        .then(res => {
            successToast(`Successfully edited quote.`)
            const updatedQuote = {
                text: text,
                attachmentURL: res.data.data.link,
                authorId: authorId,
                tags: quoteTags,
            }

            setQuotes(quotes.map(quote => {
                return quote == quoteBeingEdited ? updatedQuote : quote
            }))

            setQuoteBeingEdited(updatedQuote)
        }).catch(err => {
            errorToast(`Failed to edit quote.`)
       })
    }

    function DisplayQuote() {
        const author = authors.find(author => author._id == quote.authorId)
        const { type, attachmentURL, createdAt, text, audioURL, fragments, _id } = quote
        const filteredTags = quote.tags.filter(x => x !== null)
        const tags = quoteTags.length ? quoteTags.join(', ') : ['no tags']
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
            </>
        }
    }

    return (<>
        <DisplayQuote/>

        <div class='centered_row'>
            <label class="file_upload">
                <input
                    type="file"
                    accept=".gif,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    onKeyPress={ (event) => { event.key === 'Enter' && create() } }
                    hidden
                />
                Upload Image
            </label>

            <div style={{ width: '100%' }}><br/></div>

            <input
                type="text"
                class='edit_author_name'
                value={text}
                onChange={ (e)=> setText(e.target.value) }
                onKeyPress={ (event) => { event.key === 'Enter' && create() } }
                autoFocus
            />
            
            <div style={{ width: '100%' }}><br/></div>
            <button class='modal_submit' onClick={create} style={{ 'margin-bottom': '50px' }}>Submit</button>
        </div>
    </>)
}

export default EditQuote;