import { successToast, errorToast } from '../toasts';
import axios, * as others from 'axios'
import { useState } from 'react';

function EditTag({tagBeingEdited, guildId, setTags, tags, setTagBeingEdited}) {
    const [newTag, setNewTag] = useState(tagBeingEdited)
    
    function edit() {
        axios.patch(`/api/v1/${guildId}/tags/${tagBeingEdited}`, { newTag: newTag })
       .then(res => {
           successToast(`Successfully edited "${tagBeingEdited}".`)
           setTags(tags.map(tag => tag == tagBeingEdited ? newTag : tag))
           setTagBeingEdited(newTag)
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
        <div style={{ width: '100%' }}><br/></div>
        <button class='modal_submit' onClick={edit} style={{ 'margin-bottom': '50px' }}>Submit</button>
    </div>)
}

export default EditTag;