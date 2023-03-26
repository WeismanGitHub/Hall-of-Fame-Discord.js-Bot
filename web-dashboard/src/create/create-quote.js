import { successToast, errorToast } from '../toasts';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import 'reactjs-popup/dist/index.css'
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

const types = [
    { name: 'regular', color: '#8F00FF' },
    { name: 'audio', color: '#00A64A' },
    { name: 'multi', color: '#ff2e95' }
]

function CreateQuote({ guildId, authors, tags }) {
    const [quoteFragments, setQuoteFragments] = useState(null)
    const [quoteAuthorId, setQuoteAuthorId] = useState(null)
    const [removeImage, setRemoveImage] = useState(false)
    const [removeTags, setRemoveTags] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [audioFile, setAudioFile] = useState(null)
    const [quoteTags, setQuoteTags] = useState([])
    const [type, setType] = useState(null)
    const [text, setText] = useState('')

    const [showFragmentsPopup, setShowFragmentsPopup] = useState(false)
    const [showAuthorsPopup, setShowAuthorsPopup] = useState(false)
    const [showTagsPopup, setShowTagsPopup] = useState(false)
    
    useEffect(() => {
        if (removeTags) {
            setQuoteTags([])
        }
    }, [removeTags])

    useEffect(() => {
        if (!quoteTags.length) {
            setRemoveTags(false)
        }
    }, [quoteTags])

    useEffect(() => {
        if (removeImage) {
            setImageFile(null)
        }
    }, [removeImage])

    useEffect(() => {
        if (imageFile) {
            setRemoveImage(false)
        }
    }, [imageFile])

    function getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
    }

    async function create() {
        const quote = {
            type,
            text,
            tags: quoteTags,
            authorId: quoteAuthorId,
            fragments: quoteFragments,
        }

        if (type == 'multi') {
            if (quoteFragments?.length < 2 && quoteFragments?.length > 5) {
                return errorToast('Must have between 2 and 5 fragments.')
            }

            for (let frag of quoteFragments) {
                if (!frag.text || !frag.authorId) {
                    return errorToast('Fragments must have an author and text.')
                }
            }
    
            quote.fragments = quoteFragments
        }
        
        if (imageFile) {
            const base64Image = await getBase64(imageFile)
            
            quote.attachmentURL = (await axios.post(
                'https://api.imgur.com/3/image/',
                { image: base64Image.split(',')[1] },
                { headers: {
                    Authorization: `Client-ID ${process.env.REACT_APP_IMGUR_ID}`,
                    accept: "application/x-www-form-urlencoded"
                } }
            ).catch((err) => {
                errorToast('Error uploading image.')
            })).data.data.link
        }

        if (audioFile) {
            console.log('audio quote stuff')
        }

        axios.post(`/api/v1/${guildId}/quotes`, quote)
        .then(res => {
            successToast(`Successfully created quote.`)
        }).catch(err => {
            errorToast(`Failed to edit quote.`)
        })
    }

    return (<>
        {
            type == null ?
            <div class='type_picker'>
                {types.map(({ color, name }) => {
                    return <div style={{ float: 'left' }}>
                        <button class='type' style={{ 'background-color': color }} onClick={ () => setType(name) }>{name}</button>
                    </div>
                })}
            </div> : <>
                <DisplayQuote
                    author={authors.find(author => author._id == quoteAuthorId)}
                    type={type}
                    tags={quoteTags || []}
                    attachmentURL={removeImage ? null : (imageFile ? URL.createObjectURL(imageFile) : null)}
                    text={text}
                    fragments={quoteFragments}
                    audioURL={audioFile}
                    authors={authors}
                    createdAt={new Date()}
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
                    { !imageFile ? null :
                        <button
                            class={`popup_button ${removeImage ? 'highlighted' : 'unhighlighted'}`}
                            onClick={() => setRemoveImage(!removeImage)}
                            style={{ 'min-width': '105px'}}
                            >
                                Remove Image
                        </button>
                    }

                    {type == 'multi' ?
                        <button class="file_upload" onClick={() => setShowFragmentsPopup(true)}>Change Fragments</button> :
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
                    {...{ contentStyle: {...contentStyle, width: '700px', height: '500px' } }}
                    nested
                >
                    <FragmentsPopup
                        authors={authors}
                        setQuoteFragments={setQuoteFragments}
                        quoteFragments={quoteFragments}
                    />
                </Popup>
            </>
        }
    </>)
}

export default CreateQuote;