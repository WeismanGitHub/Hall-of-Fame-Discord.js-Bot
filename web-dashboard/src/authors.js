import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import axios, * as others from 'axios'
import { toast } from 'react-toastify'

function Authors({ authors, setQueryAuthorId, queryAuthorId, guildId }) {
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

            axios.delete(`/api/v1/authors/${guildId}`, { id: authorId })
            .then(res => {
                toast.success(`Successfully deleted "${name}".`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                })
            }).catch(err => {
                toast.error(err.message || `Failed to delete "${name}".`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                })
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
                    <Item id="copy" props={name} onClick={handleItemClick}>Copy</Item>
                    <Item id="edit" onClick={handleItemClick}>Edit</Item>
                    <Item id="delete" props={{name, _id}} onClick={handleItemClick}>Delete</Item>
                </Menu>
            </div>
            <br/>
        </div>) }
    </div>
}

export default Authors;