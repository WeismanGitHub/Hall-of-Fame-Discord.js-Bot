import { successToast, errorToast } from '../toasts';
import axios, * as others from 'axios'
import { useState } from 'react';

function CreateTag({guildId}) {
    const [tag, setTag] = useState('')
    
    function create() {
        axios.post(`/api/v1/${guildId}/tags/`, { tag: tag })
       .then(res => {
           successToast(`Successfully created "${tag}".`)
       }).catch(err => {
           errorToast(`Failed to create "${tag}".`)
       })
    }

    return (<div class='edit_tag'>
        <input
            type="text"
            class='edit_tag_input'
            value={tag}
            onChange={ (e)=> setTag(e.target.value) }
            onKeyPress={ (event) => { event.key === 'Enter' && create() } }
        />
        <div style={{ width: '100%' }}><br/></div>
        <button class='modal_submit' onClick={create} style={{ 'margin-bottom': '40px' }}>Submit</button>
    </div>)
}

export default CreateTag;