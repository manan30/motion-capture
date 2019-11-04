/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';

import Controls from './components/Controls';
import Scene from './views/Scene';

import { Form, Canvas, CodeFAB, Select, Submit } from './GlobalStyles';
import Icon from './svg/ic_code.svg';

import Constants from './utils/Constants';

function App() {
  const [value, setValue] = useState();

  const handleChange = e => {
    setValue(e.target.value);
  };

  const handleSubmit = e => {
    console.log(e);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <label>
          Please select a bvh file
          <Select value={value} onChange={handleChange}>
            {Constants.files.map((file, i) => {
              const idx = i;
              return (
                <option key={idx} value={file}>
                  {file}
                </option>
              );
            })}
          </Select>
        </label>
        <Submit type='submit' value='Load File' />
      </Form>
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
