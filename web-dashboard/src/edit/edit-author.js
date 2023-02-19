import { successToast, errorToast } from '../toasts';
import axios, * as others from 'axios'
import { useState } from 'react';

function EditAuthor({authorBeingEdited, guildId, setAuthors, authors, setAuthorBeingEdited}) {
    const [removeAccountImage, setRemoveAccountImage] = useState(false)
    const [iconURL, setIconURL] = useState(authorBeingEdited.iconURL)
    const [name, setName] = useState(authorBeingEdited.name)
    const [deleteIcon, setDeleteIcon] = useState(false)
    const [selectedImageLink, setSelectedImageLink] = useState(null)
    const [selectedFile, setSelectedFile] = useState()
    const authorId = authorBeingEdited.id
    
    function edit() {
        const update = { removeAccountImage, deleteIcon }

        if (name !== authorBeingEdited.name) {
            update.newName = name
        }
        
        // if (selectedFile) {
        //     const auth = `Client-ID ${process.env.REACT_APP_IMGUR_ID}`
        //     const formData = new FormData()
        //     formData.append("file", selectedFile);

        //     fetch("https://api.imgur.com/3/image/", {
        //         method: "POST",
        //         body: formData,
        //         headers: {
        //             Authorization: auth,
        //             Accept: "application/json",
        //         },
        //     })
        //     .then((res) => console.log(res))
        //     .catch((err) => console.log(err));

        //     // update.newIconURL = `${window.location}/images/${''}`
        // }

    //     axios.patch(`/api/v1/${guildId}/authors/${authorId}`, update)
    //     .then(res => {
    //        successToast(`Successfully edited "${authorBeingEdited.name}".`)
    //        setAuthors(authors.map(author => author == authorBeingEdited ? { iconURL, name, id: authorId } : authorBeingEdited))
    //        setAuthorBeingEdited({ iconURL, name, id: authorId })
    //    }).catch(err => {
    //        errorToast(`Failed to edit "${authorBeingEdited.name}".`)
    //    })
    }

    return (<>
        <div class='author_edit_container'>
            <div class='author_edit_preview'>
                <img
                    class='author_icon'
                    src={(selectedFile ? URL.createObjectURL(selectedFile) : null) || iconURL || "/icon.png"}
                    alt="author icon"
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

export default EditAuthor;