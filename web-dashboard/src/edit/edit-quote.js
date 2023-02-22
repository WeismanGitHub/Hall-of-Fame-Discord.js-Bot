import { successToast, errorToast } from '../toasts';
import axios, * as others from 'axios'
import { useState } from 'react';

function EditQuote({quoteBeingEdited, guildId, setQuotes, quotes, setQuoteBeingEdited, authors, tags}) {
    const [authorId, setAuthorId] = useState(quoteBeingEdited.authorId)
    const [tags, setTags] = useState(quoteBeingEdited.tags)
    const [text, setText] = useState(quoteBeingEdited.text)
    const [removeImage, setRemoveImage] = useState(false)
    const [selectedFile, setSelectedFile] = useState()
    const quoteId = quoteBeingEdited._id
    
    function getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
    }

    function edit() {
        const update = { removeImage }

        if (text !== authorBeingEdited.text) {
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
                            tags: tags,
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
                tags: tags,
            }

            setQuotes(quotes.map(quote => {
                return quote == quoteBeingEdited ? updatedQuote : quote
            }))

            setQuoteBeingEdited(updatedQuote)
        }).catch(err => {
           errorToast(`Failed to edit "${authorBeingEdited.name}".`)
       })
    }

    return (<>
        <div class='author_edit_container'>
            <div class='author_edit_preview'>
                <img
                    class='author_icon'
                    src={(selectedFile ? URL.createObjectURL(selectedFile) : null) || authorBeingEdited.iconURL || "/icon.png"}
                    alt="author icon"
                    style={{'margin-right': '10px'}}
                    width = "60"
                    height = "60"
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src="/icon.png";
                    }}
                />
                <div class='author_name'>{name}</div>
            </div>
            <br/>
        </div>

        <div class='centered_row'>
            <label class="file_upload">
                <input
                    type="file"
                    accept=".gif,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    onKeyPress={ (event) => { event.key === 'Enter' && edit() } }
                    hidden
                />
                Upload Icon
            </label>
            
            <button
                class={`popup_button ${deleteIcon ? 'highlighted' : 'unhighlighted'}`}
                onClick={() => setDeleteIcon(!deleteIcon)}
                style={{ 'min-width': '105px'}}
                >
                {`${deleteIcon == true ? 'Remove' : 'Keep'} Icon`}
            </button>

            <button
                class={`popup_button ${removeAccountImage ? 'highlighted' : 'unhighlighted'}`}
                onClick={() => setRemoveAccountImage(!removeAccountImage)}
                style={{ 'min-width': '180px'}}
                >
                {`${removeAccountImage == true ? 'Remove' : 'Keep'} Account Image`}
            </button>
        
            <div style={{ width: '100%' }}><br/></div>

            <input
                type="text"
                class='edit_author_name'
                value={name}
                onChange={ (e)=> setName(e.target.value) }
                onKeyPress={ (event) => { event.key === 'Enter' && edit() } }
                autoFocus
                />
            
            <div style={{ width: '100%' }}><br/></div>
            <button class='modal_submit' onClick={edit} style={{ 'margin-bottom': '50px' }}>Submit</button>
        </div>
    </>)
}

export default EditQuote;