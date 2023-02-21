import { Menu, Item, useContextMenu } from 'react-contexify';
import { successToast, errorToast } from '../toasts';
import 'react-contexify/ReactContexify.css';
import axios, * as others from 'axios'
import 'reactjs-popup/dist/index.css'
import Popup from 'reactjs-popup';
import { useState } from 'react';

import EditAuthor from '../edit/edit-author'

function Authors({ authors, setQueryAuthorId, queryAuthorId, guildId, setAuthors }) {
    const contentStyle = { background: '#2f3136', border: "#232428 2px solid", 'border-radius': '5px' }
    const [authorBeingEdited, setAuthorBeingEdited] = useState(null)
    const [showPop, setShowPopup] = useState(false)
    const authorContextId = 'author_id'

    function selectAuthor(id) {
        queryAuthorId == id ? setQueryAuthorId(null) : setQueryAuthorId(id)
    }
    
    const { show } = useContextMenu({
        id: authorContextId
    });

    function handleContextMenu(event, props) {
        show({ event, props })
    }

    const handleItemClick = ({ id, props }) => {
        const { name, _id } = props

        switch (id) {
        case "copy":
            navigator.clipboard.writeText(name)
            break;
        case "edit":
            setShowPopup(true)
            setAuthorBeingEdited(props)
            break;
        case "delete":
            if (!window.confirm(`Delete "${name}"?`)) {
                break
            }

            axios.delete(`/api/v1/${guildId}/authors/${_id}`)
            .then(res => {
                successToast(`Successfully deleted "${name}".`)
                setAuthors(authors.filter(author => author.name !== name))
            }).catch(err => {
                errorToast(`Failed to delete "${name}".`)
            })
            break;
        }
    }

    return <>
        <div class='authors'>
            <div class='authors_header'>Authors - { authors.length }</div>
            <hr class="authors_divider"/>
            <br/>
            { authors.map(({ _id, iconURL, name }) => <div class='author'>
                <div class={ queryAuthorId == _id ? 'highlighted' : 'unhighlighted'}>
                    <div class='author_container'
                        onClick={() => selectAuthor(_id)}
                        onContextMenu={(e) => handleContextMenu(e, { name, _id, iconURL})}
                    >
                        <img
                            class='author_icon'
                            src={iconURL || "/icon.png"}
                            alt="author icon"
                            width = "45"
                            height = "45"
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src="/icon.png";
                            }}
                        />
                        <div class='author_name'>{name}</div>
                    </div>
                    <Menu id={authorContextId} theme="dark">
                        <Item id="copy" onClick={handleItemClick}>Copy</Item>
                        <Item id="edit" onClick={handleItemClick}>Edit</Item>
                        <Item id="delete" onClick={handleItemClick}>Delete</Item>
                    </Menu>
                </div>
                <br/>
            </div>) }
        </div>
        <Popup
            open={showPop}
            position="center center"
            modal onClose={() => setShowPopup(false)}
            {...{ contentStyle }}
        >
            <EditAuthor
                authorBeingEdited={authorBeingEdited}
                guildId={guildId}
                setAuthors={setAuthors}
                authors={authors}
                setAuthorBeingEdited={setAuthorBeingEdited}
                />
        </Popup>
    </>
}

export default Authors;