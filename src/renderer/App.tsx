import React from 'react';
import { ipcRenderer } from 'electron';

function App() {
  // const [name, setName] = useState('기본');

  ipcRenderer.on('start', (event, payload) => {
    console.log(event, payload);
  });

  // ipcRenderer.on('summoner-name', (event, payload: { displayName: string }) => {
  //   setName(payload.displayName);
  //   console.log(event);
  // });

  return <h1>dsdfds</h1>;
}

export default App;
