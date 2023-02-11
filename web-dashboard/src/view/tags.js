import { Menu, Item, useContextMenu } from 'react-contexify';
import { successToast, errorToast } from '../toasts';
import 'reactjs-popup/dist/index.css';
import axios, * as others from 'axios'
import Popup from 'reactjs-popup';
import { useState } from 'react';

import EditTag from '../edit/edit-tag'

function Tags({ tags, setQueryTags, queryTags, guildId, setTags }) {
    const tagContextId = 'tag_id'
    const [showPop, setShowPopup] = useState(false)
    const [tagBeingEdited, setTagBeingEdited] = useState(null)

    function tagClick(e, tag) {
        e.preventDefault();

        if (queryTags.includes(tag)) {
            return setQueryTags(queryTags.filter(queryTag => tag !== queryTag))
        }

        const updatedQueryTags = [...queryTags, tag]

        if (updatedQueryTags.length > 3) {
            setQueryTags(updatedQueryTags.slice(1))
        } else {
            setQueryTags(updatedQueryTags)
        }
    }

    const { show } = useContextMenu({
        id: tagContextId
    });

    function handleContextMenu(event, props) {
        show({ event, props })
    }

    const handleItemClick = ({ id, props }) => {
        const { clickedTag } = props
        
        switch (id) {
        case "copy":
            navigator.clipboard.writeText(clickedTag)
            break;
        case "edit":
            setShowPopup(true)
            setTagBeingEdited(clickedTag)
            break
        case "delete":
            if (!window.confirm(`Delete "${clickedTag}"?`)) {
                break
            }

            axios.delete(`/api/v1/${guildId}/tags/${clickedTag}`)
            .then(res => {
                successToast(`Successfully deleted "${clickedTag}".`)
                setTags(tags.filter(tag => tag !== clickedTag))
            }).catch(err => {
                errorToast(`Failed to delete "${clickedTag}".`)
            })
            break;
        }
    }

    return <div class='tags'>
        <div class='tags_header'>Tags - { tags.length }</div>
        <hr class="tags_divider"/>
        <br/>

        { tags.map(tag => <>
        <div class={ queryTags.includes(tag) ? 'highlighted' : 'unhighlighted'}>
            <div class='tag_container'
                onClick={ (e) => tagClick(e, tag) }
                onContextMenu={(e) => handleContextMenu(e, { clickedTag: tag })}
            >
                <div class='tag_text'>{ tag }</div>
            </div>
            <Menu id={tagContextId} theme="dark">
                <Item id="copy" tag={tag} onClick={handleItemClick}>Copy</Item>
                <Item id="edit" tag={tag} onClick={handleItemClick}>Edit</Item>
                <Item id="delete" tag={tag} onClick={handleItemClick}>Delete</Item>
            </Menu>
        </div>
        </>) }
        <Popup open={showPop} position="center center" modal onClose={() => setShowPopup(false)} className='edit_tag'>
            <EditTag tagBeingEdited={tagBeingEdited} guildId={guildId} setTags={setTags} tags={tags}/>
        </Popup>
    </div>
}

export default Tags;