import * as moment from 'moment-timezone';

function Quotes({ quotes, authors }) {
    if (!quotes.length || !quotes) {
        return <div class='no_quotes'>
            404: No Quotes
        </div>
    }

    return <div class='quotes'>
        { quotes.map(quote => {
            const author = authors.find(author => author._id == quote.authorId)
            const { type, attachmentURL, createdAt, text } = quote

            if (type == 'regular' && !attachmentURL) {
                return <>
                    <div class='quote'>
                        <img
                            class='quote_author_icon'
                            src={ author?.iconURL || "/icon.png" }
                            alt="author icon"
                            width = "50"
                            height = "50"
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src="/icon.png";
                            }}
                        />
                        <div class='quote_author_name'>{ author?.name || 'Deleted Author' }</div>
                        <div class='quote_time'>{ moment(createdAt).calendar() }</div>
                        <div class='quote_text'>{ text }</div>
                    </div>
                    <br/>
                </>
            }
        }) }
    </div>
}

export default Quotes;