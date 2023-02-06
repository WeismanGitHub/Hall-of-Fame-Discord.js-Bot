import { Menu, Item, useContextMenu } from 'react-contexify';
import { successToast, errorToast } from './toasts';
import axios, * as others from 'axios'

function Tags({ tags, setQueryTags, queryTags, guildId, setTags }) {
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

    const tagContextId = 'tag_id'

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
            alert('Editing coming soon.')
            break;
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
    </div>
}

export default Tags;