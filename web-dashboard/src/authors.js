import { Menu, Item, useContextMenu } from 'react-contexify';
import { successToast, errorToast } from './toasts';
import 'react-contexify/ReactContexify.css';
import axios, * as others from 'axios'

function Authors({ authors, setQueryAuthorId, queryAuthorId, guildId, setAuthors }) {
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
        const { name, authorId } = props

        switch (id) {
        case "copy":
            navigator.clipboard.writeText(name)
            break;
        case "edit":
            alert('Editing coming soon.')
            break;
        case "delete":
            if (!window.confirm(`Delete "${name}"?`)) {
                break
            }

            axios.delete(`/api/v1/${guildId}/authors/${authorId}`)
            .then(res => {
                successToast(`Successfully deleted "${name}".`)
                setAuthors(authors.map(author => author.name !== name))
            }).catch(err => {
                errorToast(`Failed to delete "${name}".`)
            })
            break;
        }
    }

    return <div class='authors'>
        <div class='authors_header'>Authors - { authors.length }</div>
        <hr class="authors_divider"/>
        <br/>
        { authors.map(({ _id, iconURL, name }) => <div class='author'>
            <div class={ queryAuthorId == _id ? 'highlighted' : 'unhighlighted'}>
                <div class='author_container'
                    onClick={() => selectAuthor(_id)}
                    onContextMenu={(e) => handleContextMenu(e, { name, authorId: _id })}
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
}

export default Authors;