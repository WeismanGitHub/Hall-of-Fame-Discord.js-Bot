function Quotes({ quotes, authors }) {
    return <div class='quotes'>
        { quotes.map(quote => <div class='quote'>
            <h1>{ quote.text }</h1>
        </div>) }
    </div>
}

export default Quotes;