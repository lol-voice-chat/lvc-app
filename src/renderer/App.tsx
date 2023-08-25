import { ipcRenderer } from 'electron';
import React, { useState } from 'react';

function App() {
  const [name, setName] = useState('');

  ipcRenderer.on('summoner-name', (data: any) => {
    setName(data.displayName);
  });

  return <h1>{name}</h1>;
}

export default App;
