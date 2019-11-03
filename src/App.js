import React from 'react';

import Controls from './components/Controls';
import Scene from './views/Scene';

import { Canvas, CodeFAB } from './GlobalStyles';
import Icon from './svg/ic_code.svg';

function App() {
  return (
    <>
      <Canvas>
        <Controls />
        <Scene />
      </Canvas>
      <a
        href='https://github.com/manan30/keyframing'
        target='_blank'
        rel='noopener noreferrer'>
        <CodeFAB src={Icon} />
      </a>
    </>
  );
}

export default App;
