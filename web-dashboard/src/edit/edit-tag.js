import { successToast, errorToast } from '../toasts';
import { useState, useEffect } from 'react';
import axios, * as others from 'axios'

function EditTag({tagBeingEdited, guildId, setTags, tags}) {
    const [newTag, setNewTag] = useState(tagBeingEdited)
    
    function edit() {
        axios.patch(`/api/v1/${guildId}/tags/${tagBeingEdited}`, { newTag: newTag })
       .then(res => {
           successToast(`Successfully edited "${tagBeingEdited}".`)
           setTags(tags.map(tag => tag == tagBeingEdited ? newTag : tag))
       }).catch(err => {
           errorToast(`Failed to edit "${tagBeingEdited}".`)
       })
    }

    return (<div class='edit_tag'>
        <input
            type="text"
            class='edit_tag_input'
            value={newTag}
            onChange={ (e)=> setNewTag(e.target.value) }
            onKeyPress={ (event) => { event.key === 'Enter' && edit() } }
        />
    </div>)
}

export default EditTag;