import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';


const fetchData = async () => {
    try {
        const resp = await axios.get('https://3.22.81.67/')
        const data = await JSON.parse(resp);

        return data;
    } catch(error) {
        console.error(error);
    }
}

export const App = () => {
    const [data, setData] = useState('');

    const testFetch = async () => {
        const fetchedData = await fetchData();

        setData(fetchedData);
    }

    useEffect(() => {
        testFetch();
    }, [])
    

    return (
        <div style={
            {
                'width': '100vw',
                'height': '100vh',
                'backgroundColor': 'black',
                'display': 'flex',
                'justifyContent': 'center',
                'alignItems': 'center'
            }
        }>
            <h1 style={
                {
                    'font': 'Arial',
                    'fontSize': '24px'
                }
            }>
                Hola mundo desde {data}!
            </h1>
        </div>
    )
}
