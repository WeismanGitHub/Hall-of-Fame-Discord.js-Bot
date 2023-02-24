import { successToast, errorToast } from '../toasts';
import axios, * as others from 'axios'
import { useState } from 'react';

function CreateAuthor({guildId}) {
    const [iconURL, setIconURL] = useState('')
    const [name, setName] = useState('')
    
    function create() {
        axios.post(`/api/v1/${guildId}/authors/`, { name, iconURL })
       .then(res => {
           successToast(`Successfully created "${name}".`)
       }).catch(err => {
           errorToast(`Failed to create "${name}".`)
       })
    }

    return (<div>

    </div>)
}

export default CreateAuthor;