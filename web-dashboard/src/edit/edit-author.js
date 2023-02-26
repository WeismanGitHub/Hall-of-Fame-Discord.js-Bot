import { successToast, errorToast } from '../toasts';
import axios, * as others from 'axios'
import { useState } from 'react';

function EditAuthor({authorBeingEdited, guildId, setAuthors, authors, setAuthorBeingEdited}) {
    const [removeDiscordId, setRemoveDiscordId] = useState(false)
    const [removeIconURL, setRemoveIconURL] = useState(false)
    const [name, setName] = useState(authorBeingEdited.name)
    const [selectedFile, setSelectedFile] = useState()
    const authorId = authorBeingEdited._id
    
    function getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
    }

    function edit() {
        const update = { removeDiscordId, removeIconURL }

        if (name !== authorBeingEdited.name) {
            update.name = name
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
                    update.iconURL = res.data.data.link

                    axios.patch(`/api/v1/${guildId}/authors/${authorId}`, update)
                    .then(res => {
                        successToast(`Successfully edited "${authorBeingEdited.name}".`)

                        setAuthors(authors.map(author => {
                            return author == authorBeingEdited ? { iconURL: update.iconURL, name, _id: authorId } : author
                        }))

                        setAuthorBeingEdited({ iconURL: update.iconURL, name, id: authorId })
                    }).catch(err => {
                        errorToast(`Failed to edit "${authorBeingEdited.name}".`)
                    })
                }).catch((err) => {
                    errorToast('Error uploading image.')
                });
            })

            return
        }

        axios.patch(`/api/v1/${guildId}/authors/${authorId}`, update)
        .then(res => {
           successToast(`Successfully edited "${authorBeingEdited.name}".`)

           setAuthors(authors.map(author => {
                return author == authorBeingEdited ? { iconURL: authorBeingEdited.iconURL, name, _id: authorId } : author
           }))

           setAuthorBeingEdited({ iconURL: update.iconURL, name, id: authorId })
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
                class={`popup_button ${removeIconURL ? 'highlighted' : 'unhighlighted'}`}
                onClick={() => setRemoveIconURL(!removeIconURL)}
                style={{ 'min-width': '105px'}}
                >
                {`${removeIconURL == true ? 'Remove' : 'Keep'} Icon`}
            </button>

            <button
                class={`popup_button ${removeDiscordId ? 'highlighted' : 'unhighlighted'}`}
                onClick={() => setRemoveDiscordId(!removeDiscordId)}
                style={{ 'min-width': '180px'}}
                >
                {`${removeDiscordId == true ? 'Remove' : 'Keep'} Account Image`}
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

export default EditAuthor;