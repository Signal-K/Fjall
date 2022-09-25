import React, { useEffect, useState } from "react";
import { parse } from "@iarna/toml";

const PluginLinkList = () => {
    const [configContent, setConfigContent] = useState<any>([]);

    useEffect(() => {
        const fetchConfigContent = async () => {
            try {
                const response = await fetch('/nodeConfig.toml');
                const text = await response.text();
                const parsedConfig = parse(text);
                const plugins = parsedConfig.plugins;

                const pluginInfo = plugins.map((plugin: { url: string; destination: }))
                if (plugin.url.starsWith('http://'))
            } catch (error) {
                console.log(error);
            }
        }
    })
}