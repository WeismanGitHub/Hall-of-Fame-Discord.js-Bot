import axios, * as others from 'axios'
import { toast } from 'react-toastify'

function Authors({ authors, setQueryAuthorId, queryAuthorId, guildId }) {
    function selectAuthor(id) {
        queryAuthorId == id ? setQueryAuthorId(null) : setQueryAuthorId(id)
    }
    
    function deleteAuthor(name, id) {
        if (window.confirm(`Delete "${name}"?`)) {
            axios.delete(`/api/v1/authors/${guildId}`, { id: id })
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
            })
            .catch(err => {
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
        }
    }

    return <div class='authors'>
        <div class='authors_header'>Authors - { authors.length }</div>
        <hr class="authors_divider"/>
        <br/>
        { authors.map(author => <div class='author'>
            <div class={ queryAuthorId == author._id ? 'highlighted' : 'unhighlighted'}>
                <div
                    class='author_container'
                    onClick={() => selectAuthor(author._id)}
                    onContextMenu={(e) => {e.preventDefault(); deleteAuthor(author.name, author._id)}}
                >
                    <img
                        class='author_icon'
                        src={author?.iconURL || "/icon.png"}
                        alt="author icon"
                        width = "45"
                        height = "45"
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src="/icon.png";
                        }}
                    />
                    <div class='author_name'>{author.name}</div>
                </div>
            </div>
            <br/>
        </div>) }
    </div>
}

export default Authors;