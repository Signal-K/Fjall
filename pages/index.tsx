import { useState } from 'react';
import ApiSelection from '../components/selections/ApiSelection';
import ApiReader from '../components/selections/ApiReader';
import ApiSender from '../components/selections/ApiSender';
import PluginList from '../components/selections/fullPluginList';

const HomePage = () => {
  const [selectedApis, setSelectedApis] = useState<string[]>([]);

  return (
    <div className="container mx-auto my-8 max-w-md">
      {/* <ApiSelection setSelectedApis={setSelectedApis} /> */}
      {selectedApis.includes('rust') && <ApiReader apiName="rust" />}
      {selectedApis.includes('ruby') && <ApiReader apiName="ruby" />}
      {selectedApis.includes('flask') && <ApiReader apiName="flask" />}
      {selectedApis.includes('express') && <ApiReader apiName="express" />}
      {selectedApis.includes('rust') && <ApiSender apiName="rust" />}
      {selectedApis.includes('ruby') && <ApiSender apiName="ruby" />}
      {selectedApis.includes('flask') && <ApiSender apiName="flask" />}
      {selectedApis.includes('express') && <ApiSender apiName="express" />}
      <PluginList />
    </div>
  );
};

export default HomePage;