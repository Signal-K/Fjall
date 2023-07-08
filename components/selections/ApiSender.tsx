import axios from "axios";
import { useState } from "react";

interface ApiSenderProps {
    apiName: string;
};

const ApiSender: React.FC<ApiSenderProps> = ({ apiName }) => {
    const [inputText, setInputText] = useState('');
    const [responseText, setResponseText] = useState('');
    
    const handleSendClick = async () => {
        try {
            const response = await axios.post(`/api/${apiName}/send`, { text: inputText });
            setResponseText(response.data);
        } catch (error) {
            setResponseText('Error sending data to the API');
            console.error(error);
        };
    };

    return (
        <div className="my-4">
            <h3 className="text-lg font-semibold mb-2">{apiName.toUpperCase()} API:</h3>
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="border p-2"
                placeholder="Enter text to send"
            />
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded ml-2"
                onClick={handleSendClick}
            >
                Send Text
            </button>
            <div className="mt-2">
                <p>{responseText}</p>
            </div>
        </div>
    );
}

export default ApiSender;