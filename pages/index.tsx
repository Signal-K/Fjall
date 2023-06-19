import { useEffect, useState } from 'react';

type Plugin = string;

const IndexPage: React.FC = () => {
  const [rustPlugins, setRustPlugins] = useState<Plugin[]>([]);
  const [rubyPlugins, setRubyPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    /* fetch('http://localhost:8080/api/plugins')
		.then((response) => response.json())
		.then((data) => setRustPlugins(data)); */

	fetch('http://localhost:4567/api/plugins')
		.then((response) => response.json())
		.then((data) => setRustPlugins(data));
  }, []);

  return (
    <div>
      <h1>Available Plugins</h1>
      <ul>
        {/* {rustPlugins.map((plugin) => (
          <li key={plugin}>{plugin}</li>
        ))} */}
		{rubyPlugins.map((plugin) => (
          <li key={plugin}>{plugin}</li>
        ))}
      </ul>
    </div>
  );
};

export default IndexPage;