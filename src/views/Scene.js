import React, { useState, useEffect, useRef } from 'react';
import { useThree, useRender } from 'react-three-fiber';

import * as THREE from 'three';
import Light from '../components/Light';
import Floor from '../components/Floor';
import StickFigure from '../components/StickFigure';

import File from '../files/Stand.bvh';

import BVHHelper from '../utils/BVHHelper';

const fileContents = fetch(File)
  .then(res => res.text())
  .then(contents => contents);

let skeletonHelper;
let mixer;

function Scene() {
  const { camera, scene } = useThree();
  const [contents, setContents] = useState();
  const [data, setData] = useState();
  const stickFigureRef = useRef();

  camera.fov = 60;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.near = 1;
  camera.far = 100;

  camera.position.set(0, 200, 400);

  fileContents.then(res => setContents(res));

  useEffect(() => {
    if (contents)
      setData(() => {
        const raw = BVHHelper.readBvh(contents.split(/[\r\n]+/g));
        return BVHHelper.toTHREE(raw);
      });
  }, [contents]);

  if (stickFigureRef.current && data) {
    stickFigureRef.current.scale.set(0.9, 0.9, 0.9);
    stickFigureRef.current.position.set(0, 0, 0);
    stickFigureRef.current.add(data.skeleton.bones[0]);
    stickFigureRef.current.bind(data.skeleton);
    skeletonHelper = new THREE.SkeletonHelper(stickFigureRef.current);
    skeletonHelper.material.linewidth = 50;
    scene.add(skeletonHelper);

    mixer = new THREE.AnimationMixer(stickFigureRef.current);
    mixer
      .clipAction(data.clip)
      .setEffectiveWeight(1.0)
      .play();
  }

  useRender((_, delta) => {
    if (mixer) mixer.update(delta);
  });

  return (
    <>
      <Light type='AmbientLight' intensity={0.5} />
      <Floor />
      <StickFigure setRef={stickFigureRef} />
    </>
  );
}

export default Scene;
