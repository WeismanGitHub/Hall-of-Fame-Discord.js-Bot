function SearchArea({ setQueryText, search, queryText, setQueryDate, queryDate, queryType, setQueryType }) {
    function dateClick() {
        setQueryDate(queryDate == 'new' ? 'old' : 'new')
    }

    function typeClick(type) {
        setQueryType(queryType == type ? null : type)
    }

    const types = [
        { name: 'regular', color: '#8F00FF' },
        { name: 'image', color: '#FF7B00' },
        { name: 'audio', color: '#00A64A' },
        { name: 'multi', color: '#ff2e95' }
    ]

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
            {types.map(({ color, name }) => {
                return <div style={{ float: 'left' }}>
                    <div class={ queryType == name ? 'highlighted' : 'unhighlighted'}>
                        <button class='type' style={{ 'background-color': color }} onClick={ () => typeClick(name) }>{name}</button>
                    </div>
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