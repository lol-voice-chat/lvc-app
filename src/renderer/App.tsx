import React, { useEffect, useState } from 'react';
const { ipcRenderer } = window.require('electron');

function App() {
  const [name, setName] = useState('');

  useEffect(() => {
    ipcRenderer.once('summoner-name', (event, summoner: { name: string }) => {
      setName(summoner.name);
    });
  });

  return <h1>{name}</h1>;
}

export default App;
