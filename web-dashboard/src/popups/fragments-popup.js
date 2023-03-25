import AuthorsPopup from './authors-popup'
import 'reactjs-popup/dist/index.css'
import Popup from 'reactjs-popup';
import { useState } from 'react'

const contentStyle = {
    background:
    '#2f3136',
    border: "#232428 2px solid",
    'border-radius': '5px',
    height: '300px',
    width: '300px'
}

function FragmentsPopup({ authors, setQuoteFragments, quoteFragments }) {
    const [fragmentBeingEdited, setFragmentBeingEdited] = useState(null)
    const [showAuthorsPopup, setShowAuthorsPopup] = useState(false)

    function setFragmentAuthorId(id) {
        setQuoteFragments(quoteFragments.map(frag => {
            if (frag.authorId == fragmentBeingEdited.authorId && frag.text == fragmentBeingEdited.text) {
                frag.authorId = id

                setFragmentBeingEdited(frag)
            }

            return frag
        }))
    }

    function deleteFragment(fragment) {
        if (fragment?.authorId == fragmentBeingEdited?.authorId && fragment?.text == fragmentBeingEdited?.text) {
            setFragmentBeingEdited(null)
        }
        
        setQuoteFragments(quoteFragments.filter(frag => frag !== fragment))
    }

    function createFragment() {
        setFragmentBeingEdited({ authorId: null, text: '' })
        setQuoteFragments([...quoteFragments, { authorId: null, text: '' }])
    }

    function changeAuthor(fragment) {
        setFragmentBeingEdited(fragment)
        setShowAuthorsPopup(true)
    }
    
    return (<>
        <div className="quote_message_body">
            { quoteFragments.map(fragment => {
                const { text, authorId } = fragment
                const author = authors.find(author => author._id == authorId)

                return <div className='quote_message' style={{'background-color': '#292c30'}}>
                    <div style={{width: '100px', padding: '5px'}}>
                        <button
                            style={{padding: '5px'}}
                            class='modal_submit'
                            onClick={()=> changeAuthor(fragment)}
                        >
                            Author
                        </button>

                        { quoteFragments.length <= 2 ? null : 
                            <button
                                class='modal_submit'
                                onClick={()=> deleteFragment(fragment)}
                                style={{padding: '5px', 'margin-top': '3px'}}
                            >
                                Delete
                            </button>
                        }
                    </div>

                    <div className="quote_author_avatar">
                        <img
                            src={ author?.iconURL || "/icon.png" }
                            alt="author icon"
                            width = "40"
                            height = "40"
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src="/icon.png";
                            }}
                        />
                    </div>
                    <div className="quote_message_content">
                        <div>
                            <span className="quote_author_info">
                                <span className="quote_author_username">{ author?.name || 'Deleted Author' }</span>
                            </span>
                        </div>

                        <div className="quote_message_body" style={{padding: '3px'}}>
                            <input
                                type="text"
                                class='edit_author_name'
                                value={text}
                                onChange={ (e)=> {
                                    setQuoteFragments(quoteFragments.map(frag => {
                                        if (frag == fragment) {
                                            frag.text = e.target.value
                                        }

                                        return frag
                                    }))
                                }}
                                autoFocus= {quoteFragments[0] == fragment}
                            />
                        </div>
                    </div>
                </div>
            })}
        </div>

        { (quoteFragments.some(frag => frag.text === '') || fragmentBeingEdited?.authorId === null || quoteFragments.length >= 5)
            ? null :
            <div class='centered_row'>
                <button class='modal_submit' onClick={createFragment} style={{ 'margin-bottom': '50px' }}>New Fragment</button>
            </div>
        }

        <Popup
            open={showAuthorsPopup}
            position="center center"
            modal onClose={() => setShowAuthorsPopup(false)}
            {...{ contentStyle }}
            nested
        >
            <AuthorsPopup
                authors={authors}
                setQuoteAuthorId={setFragmentAuthorId}
                quoteAuthorId={fragmentBeingEdited?.authorId}
            />
        </Popup>
    </>)
}

export default FragmentsPopup;