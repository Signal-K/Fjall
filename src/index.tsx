import * as esbuild from 'esbuild-wasm';
import { useState } from 'react';
import ReactDOM from 'react-dom';

const App = () => {
    const [input, setInput] = useState('');
    const [code, setCode] = useState(''); // Transpiled & bundled code input

    // Initalise esbuild web assembly compiler
    const startService = async () => {
        const service = await esbuild.startService({
            worker: true,
            wasmURL: '/esbuild.wasm'
        });
        console.log(service);
    }

    // Event handler for submit function
    const onClick = () => {
        console.log(input);
    }

    return <div>
        <textarea value={input} onChange={e => setInput(e.target.value)}></textarea> {/* When the user types in here, update the state */}
        <div>
            <button onClick={onClick}>Submit</button>
        </div>
        <pre>{code}</pre> {/* Container for the code/function boxes */}
    </div>
};

ReactDOM.render(
    <App />,
    document.querySelector('#root')
);
