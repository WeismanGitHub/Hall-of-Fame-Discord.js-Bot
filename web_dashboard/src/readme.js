import { useState, useEffect } from 'react';
import axios, * as others from 'axios'
import Markdown from 'markdown-to-jsx';

function Readme() {
    const [readme, setReadme] = useState('')

    useEffect(() => {
        axios.get('/api/v1/readme')
        .then(res => setReadme(res.data))
    }, [])

    return (<Markdown>{ readme }</Markdown>)
}

export default Readme;