import React, { useState } from "react";
import axios from "axios";

const PluginList: React.FC = () => {
    const [selectedApis, setSelectedApis] = useState<string[]>([]);
    const [textResponses, setTextResponses] = useState<{ [key: string]: string }>({});
    const [inputText, setInputText] = useState('');

    const toggleApi = (apiName: string) => {
        setSelectedApis((prevSelectedApis) =>
            prevSelectedApis.includes(apiName)
                ? prevSelectedApis.filter((name) => name !== apiName)
                : [...prevSelectedApis, apiName]
        );
    };

    const readFromApi = async (apiName: string) => {
        try {
            const response = await axios.get(`/api/${apiName}/read`);
            setTextResponses((prevResponses) => ({ ...prevResponses, [apiName]: response.data }));
        } catch (error) {
            console.error(`Error reading from ${apiName} API:`, error);
        }
    };

    const sendToApi = async (apiName: string) => {
        try {
            const response = await axios.post(`/api/${apiName}/send`, { text: inputText });
            setTextResponses((prevResponses) => ({ ...prevResponses, [apiName]: response.data }));
        } catch (error) {
            console.error(`Error sending data to ${apiName} API:`, error);
        }
    };

    return (
        <div className="container mx-auto my-8 max-w-md">
          <h1 className="text-3xl font-bold mb-6">Nodes API</h1>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Select APIs:</h2>
            <label>
              <input
                type="checkbox"
                checked={selectedApis.includes('rust')}
                onChange={() => toggleApi('rust')}
              />
              Rust API
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedApis.includes('ruby')}
                onChange={() => toggleApi('ruby')}
              />
              Ruby API
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedApis.includes('flask')}
                onChange={() => toggleApi('flask')}
              />
              Flask API
            </label>
            <label>
              <input
                type="checkbox"
                checked={selectedApis.includes('express')}
                onChange={() => toggleApi('express')}
              />
              Express/Typescript API
            </label>
          </div>
          {selectedApis.map((apiName) => (
            <div key={apiName} className="my-4">
              <h3 className="text-lg font-semibold mb-2">{apiName.toUpperCase()} API:</h3>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                onClick={() => readFromApi(apiName)}
              >
                Read First Bit of Text
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded ml-2"
                onClick={() => sendToApi(apiName)}
              >
                Send Text
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="border p-2 ml-2"
                placeholder="Enter text to send"
              />
              <div className="mt-2">
                <p>{textResponses[apiName]}</p>
              </div>
            </div>
          ))}
        </div>
      );
    };    
  
export default PluginList;