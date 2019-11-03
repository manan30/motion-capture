import React, { useState, useEffect, useRef } from 'react';
import { useThree } from 'react-three-fiber';

import * as THREE from 'three';
import Light from '../components/Light';
import Floor from '../components/Floor';
import StickFigure from '../components/StickFigure';

import File from '../files/Stand.bvh';

import BVHHelper from '../utils/BVHHelper';

const fileContents = fetch(File)
  .then(res => res.text())
  .then(contents => contents);

function Scene() {
  const { camera, scene } = useThree();
  const [contents, setContents] = useState();
  const [data, setData] = useState();
  const stickFigureRef = useRef();

  camera.position.set(0, 5, 10);

  fileContents.then(res => setContents(res));

  useEffect(() => {
    if (contents)
      setData(() => {
        const raw = BVHHelper.readBvh(contents.split(/[\r\n]+/g));
        return BVHHelper.toTHREE(raw);
      });
  }, [contents]);

  if (stickFigureRef.current && data) {
    stickFigureRef.current.add(data.skeleton.bones[0]);
    stickFigureRef.current.bind(data.skeleton);
    const skeletonHelper = new THREE.SkeletonHelper(stickFigureRef.current);
    skeletonHelper.material.linewidth = 5;
    scene.add(skeletonHelper);
  }

  return (
    <>
      <Light type='AmbientLight' intensity={0.5} />
      <Floor />
      <StickFigure setRef={stickFigureRef} />
    </>
  );
}

export default Scene;
