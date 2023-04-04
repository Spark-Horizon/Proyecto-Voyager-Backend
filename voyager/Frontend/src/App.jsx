import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';


const fetchData = () => {
    axios.get('http://3.22.81.67:5000/')
        .then(response => {
            return response.data
        })
        .catch(error => {
            console.error(error);
        });
}

export const App = () => {
    const [data, setData] = useState('');

    const testFetch = async () => {
        const fetchedData = fetchData();
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
