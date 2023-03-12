import { successToast, errorToast } from '../toasts';
import axios, * as others from 'axios'
import 'reactjs-popup/dist/index.css'
import { useState } from 'react';
import Popup from 'reactjs-popup';

import FragmentsPopup from '../popups/fragments-popup'
import AuthorsPopup from '../popups/authors-popup'
import TagsPopup from '../popups/tags-popup'
import DisplayQuote from '../display-quote'

const contentStyle = {
    background:
    '#2f3136',
    border: "#232428 2px solid",
    'border-radius': '5px',
    height: '300px',
    width: '300px'
}

function EditQuote({quoteBeingEdited, guildId, setQuotes, quotes, setQuoteBeingEdited, authors, tags}) {
    const [setQuoteFragments, quoteFragments] = useState(quoteBeingEdited.fragments)
    const [quoteAuthorId, setQuoteAuthorId] = useState(quoteBeingEdited.authorId)
    const [quoteTags, setQuoteTags] = useState(quoteBeingEdited.tags)
    const [text, setText] = useState(quoteBeingEdited.text)
    const [removeImage, setRemoveImage] = useState(false)
    const [removeTags, setRemoveTags] = useState(false)
    const attachmentURL = quoteBeingEdited.attachmentURL
    const [imageFile, setImageFile] = useState(null)
    const [audioFile, setAudioFile] = useState(null)
    const createdAt = quoteBeingEdited.createdAt
    const audioURL = quoteBeingEdited.audioURL
    const quoteId = quoteBeingEdited._id
    const type = quoteBeingEdited.type

    const [showFragmentsPopup, setShowFragmentsPopup] = useState(false)
    const [showAuthorsPopup, setShowAuthorsPopup] = useState(false)
    const [showTagsPopup, setShowTagsPopup] = useState(false)
    
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
        
        if (imageFile) {
            getBase64(imageFile)
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
                            authorId: quoteAuthorId,
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
                authorId: quoteAuthorId,
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

    return (<>
        <DisplayQuote
            author={authors.find(author => author._id == quoteAuthorId)}
            type={type}
            tags={quoteTags || []}
            attachmentURL={removeImage ? null : (imageFile || attachmentURL)}
            text={text}
            fragments={quoteFragments}
            audioURL={audioFile || audioURL}
            authors={authors}
            createdAt={createdAt}
        />

        <div class='centered_row'>
            {type !== 'audio' ? null : <label class="file_upload">
                <input
                    type="file"
                    accept=".mp3,.wav,.ogg"
                    onChange={(e) => setAudioFile(e.target.files[0])}
                    onKeyPress={ (event) => { event.key === 'Enter' && create() } }
                    hidden
                />
                Upload Audio
            </label>}
            <label class="file_upload">
                <input
                    type="file"
                    accept=".gif,.jpg,.jpeg,.png"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    onKeyPress={ (event) => { event.key === 'Enter' && create() } }
                    hidden
                />
                Upload Image
            </label>
            { !quoteBeingEdited.attachmentURL ? null :
                <button
                    class={`popup_button ${removeImage ? 'highlighted' : 'unhighlighted'}`}
                    onClick={() => setRemoveImage(!removeImage)}
                    style={{ 'min-width': '105px'}}
                    >
                        Remove Image
                </button>
            }

            {type == 'multi' ?
                <button class="file_upload" onClick={() => setShowFragmentsPopup(true)}>Create Fragments</button> :
                <button class="file_upload" onClick={() => setShowAuthorsPopup(true)}>Select Author</button>
            }

            { !quoteTags?.length ? null :
                <button
                    class={`popup_button ${removeTags ? 'highlighted' : 'unhighlighted'}`}
                    onClick={() => setRemoveTags(!removeTags)}
                    style={{ 'min-width': '105px'}}
                    >
                        Remove Tags
                </button>
            }

            <button class="file_upload" onClick={() => setShowTagsPopup(true)}>Select Tags</button>

            <div style={{ width: '100%' }}><br/></div>

            <input
                type="text"
                class='edit_author_name'
                style={{ width: '550px' }}
                value={text}
                onChange={ (e)=> setText(e.target.value) }
                onKeyPress={ (event) => { event.key === 'Enter' && create() } }
                autoFocus
            />
            
            <div style={{ width: '100%' }}><br/></div>
            <button class='modal_submit' onClick={create} style={{ 'margin-bottom': '50px' }}>Submit</button>
        </div>

        <Popup
            open={showTagsPopup}
            position="center center"
            modal onClose={() => setShowTagsPopup(false)}
            {...{ contentStyle }}
            nested
        >
            <TagsPopup
                tags={tags}
                setQuoteTags={setQuoteTags}
                quoteTags={quoteTags}
            />
        </Popup>

        <Popup
            open={showAuthorsPopup}
            position="center center"
            modal onClose={() => setShowAuthorsPopup(false)}
            {...{ contentStyle }}
            nested
        >
            <AuthorsPopup
                authors={authors}
                setQuoteAuthorId={setQuoteAuthorId}
                quoteAuthorId={quoteAuthorId}
            />
        </Popup>

        <Popup
            open={showFragmentsPopup}
            position="center center"
            modal onClose={() => setShowFragmentsPopup(false)}
            {...{ contentStyle }}
            nested
        >
            <FragmentsPopup
                authors={authors}
                setQuoteFragments={setQuoteFragments}
                quoteFragments={quoteFragments}
            />
        </Popup>
    </>)
}

export default EditQuote;