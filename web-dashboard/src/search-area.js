function SearchArea({ setQueryText, search, queryText, setQueryDate, queryDate, queryType, setQueryType }) {
    function dateClick() {
        setQueryDate(queryDate == 'new' ? 'old' : 'new')
    }

    const queryTypes = ['regular', 'image', 'audio', 'multi']

    return <div class='footer'>
        <input
            type="text"
            class='text_search_bar'
            value={ queryText }
            placeholder="search text..."
            onChange={ (e)=> setQueryText(e.target.value) }
            onKeyPress={ (event) => { event.key === 'Enter' && search() } }
        />

        <button class='date_picker' onClick={ dateClick }>{`${queryDate}est`}</button>

        <div class='type_picker'>
            {queryTypes.map(type => {
                return <div class={ queryType == type ? 'highlighted' : 'unhighlighted'}>
                    <button class={`${type}_type`} onClick={ () => setQueryType(type) }>{type}</button>
                </div>
            })}
        </div>

        <img
            class='search_icon'
            src='/search.png'
            alt="search icon"
            width = "45"
            height = "45"
            title = 'search'
            onClick={ search }
        />
    </div>
}

export default SearchArea;