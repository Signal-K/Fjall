import axios from "axios";
import React, { useState } from "react";

interface ApiReaderProps {
    apiName: string;
}

const ApiReader: React.FC<ApiReaderProps> = ({ apiName }) => {
    const [text, setText] = useState('');
    const handleReadClick = async () => {
        try {
            const response = await axios.get(`/api/${apiName}/read`);
            setText(response.data);
        } catch (error) {
            setText('Error reading from the API');
            console.error(error);
        }
    };

    return (
        <div className="my-4">
            <h3 className="text-lg font-semibold mb-2">{apiName.toUpperCase()} API:</h3>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                onClick={handleReadClick}
            >
                Read first textual component
            </button>
            <p>{text}</p>
        </div>
    );
};

export default ApiReader;