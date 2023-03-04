import { successToast, errorToast } from '../toasts';
import axios, * as others from 'axios'
import { useState } from 'react';

function CreateAuthor({guildId}) {
    const [selectedFile, setSelectedFile] = useState()
    const [name, setName] = useState('')
    
    function getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
    }

    function create() {
        const author = { name }

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
                    author.iconURL = res.data.data.link

                    axios.post(`/api/v1/${guildId}/authors/`, author)
                    .then(res => {
                        successToast(`Successfully created "${name}".`)
                    }).catch(err => {
                        errorToast(`Failed to create "${name}".`)
                    })
                }).catch((err) => {
                    errorToast('Error uploading image.')
                });
            })

            return
        }

        axios.post(`/api/v1/${guildId}/authors/`, author)
        .then(res => {
           successToast(`Successfully created "${name}".`)
        }).catch(err => {
           errorToast(`Failed to create "${name}".`)
       })
    }

    return (<>
        <div class='author_edit_container'>
            <div class='author_edit_preview'>
                <img
                    class='author_icon'
                    src={(selectedFile ? URL.createObjectURL(selectedFile) : null) || "/icon.png"}
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
            <div style={{'margin': '5px'}}></div>
            <label class="file_upload">
                <input
                    type="file"
                    accept=".gif,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    onKeyPress={ (event) => { event.key === 'Enter' && create() } }
                    hidden
                />
                Upload Icon
            </label>

            <div style={{ width: '100%' }}><br/></div>
            <div style={{'margin': '5px'}}></div>

            <input
                type="text"
                class='edit_author_name'
                value={name}
                onChange={ (e)=> setName(e.target.value) }
                onKeyPress={ (event) => { event.key === 'Enter' && create() } }
                autoFocus
                />
            
            <div style={{ width: '100%' }}><br/></div>
            <button class='modal_submit' onClick={create} style={{ 'margin-bottom': '50px' }}>Submit</button>
        </div>
    </>)
}

export default CreateAuthor;