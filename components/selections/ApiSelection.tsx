import { useState } from "react";

const ApiSelection = () => {
    const [selectedApis, setSelectedApis] = useState<string[]>([]);
    const handleApiToggle = (apiName: string) => {
        setSelectedApis((prevSelectedApis) => 
            prevSelectedApis.includes(apiName)
                ? prevSelectedApis.filter((name) => name !== apiName)
                : [...prevSelectedApis, apiName]
            );
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Select APIs:</h2>
            <div className="space-y-2">
                <label>
                    <input
                        type="checkbox"
                        checked={selectedApis.includes('rust')}
                        onChange={() => handleApiToggle('rust')}
                    />Rust API
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={selectedApis.includes('ruby')}
                        onChange={() => handleApiToggle('ruby')}
                    />Ruby API
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={selectedApis.includes('flask')}
                        onChange={() => handleApiToggle('flask')}
                    />Flask API
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={selectedApis.includes('express')}
                        onChange={() => handleApiToggle('express')}
                    />Express API
                </label>
            </div>
        </div>
    )
}