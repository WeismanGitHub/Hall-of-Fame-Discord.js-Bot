import { successToast, errorToast } from '../toasts';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'

function EditAuthor({authorBeingEdited, guildId, setAuthors, authors, setAuthorBeingEdited}) {
    const [iconURL, setIconURL] = useState(authorBeingEdited.iconURL)
    const [name, setName] = useState(authorBeingEdited.name)
    const [deleteIcon, setDeleteIcon] = useState(false)
    const authorId = authorBeingEdited.id
    
    function edit() {
        axios.patch(`/api/v1/${guildId}/authors/${authorId}`, {
            deleteIcon: deleteIcon,
            iconURL: iconURL,
            name: name,
        })
       .then(res => {
           successToast(`Successfully edited "${authorBeingEdited.name}".`)
           setAuthors(authors.map(author => author == authorBeingEdited ? { iconURL, name, authorId } : authorBeingEdited))
           setAuthorBeingEdited({ iconURL, name, authorId })
       }).catch(err => {
           errorToast(`Failed to edit "${authorBeingEdited.name}".`)
       })
    }

    function onFileChange(event) {
        console.log(event)
    }

    return (<div class='edit_author'>
        <input
            type="file"
            class='author_icon_input'
            accept=".gif,.jpg,.jpeg,.png"
            onChange={onFileChange}
            onKeyPress={ (event) => { event.key === 'Enter' && edit() } }
        />

        <button class='modal_sumit' onClick={setDeleteIcon(true)}>Remove Icon</button>

        <input
            type="text"
            class='edit_author_name'
            value={name}
            onChange={ (e)=> setName(e.target.value) }
            onKeyPress={ (event) => { event.key === 'Enter' && edit() } }
        />
        
        <div style={{ width: '100%' }}><br/></div>
        <button class='modal_submit' onClick={edit} style={{ 'margin-bottom': '50px' }}>Submit</button>
    </div>)
}

export default EditAuthor;