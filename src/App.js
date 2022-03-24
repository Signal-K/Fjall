import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Nav from "./Nav/Nav";

import "./App.scss";

function App() {
    const posterSource = "";

    const theme = extendTheme({
        colors: {
            brand: {
                100: "#FFF",
                900: "#000",
            },
        },
        fonts: {
            body: "'Helvetica Neue', sans-serif",
            heading: "'Helvetica Neue', sans-serif",
            mono: "'Helvetica Neue', sans-serif",
        },
        styles: {
            global: {
                body: {
                    bg: "none",
                    lineHeight: "base",
                },
                button: {
                    verticalAlign: "middle",
                    display: "inline-flex",
                },
                input: {},
                textarea: {},
                p: {},
                div: {},
            },
        },
    });

    return (
        <div className="container" style={{ heigh: "" }}>
            <ChakraProvider theme={theme}>
                <Nav />
            </ChakraProvider>
        </div>
    );
}

export default App;