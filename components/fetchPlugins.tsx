import { useEffect, useState } from "react";
import { parse } from "@iarna/toml";

const PluginDisplay = () => {
    const [configContent, setConfigContent] = useState('');

    useEffect(() => {
        const fetchConfigContent = async () => {
            try {
                const response = await fetch('/nodeConfig.toml');
                const text = await response.text();
                const parsedConfig = parse(text);

                // Assuming the plugins array is always present in the config
                const plugins = parsedConfig.plugins;
 
                // Display config content
                const pluginInfo = plugins
                    .map((plugin: { url: string; destination: string }) =>
                        `URL: ${plugin.url}, Destination: ${plugin.destination}`
                    ).join('\n')

                setConfigContent(pluginInfo)
            } catch {

            }
        }
    })
}