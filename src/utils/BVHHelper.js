import * as THREE from 'three';

const BvhHelper = new (function BvhHelper() {
  /*
		converts the internal bvh node structure to a THREE.Bone hierarchy

		source: the bvh root node
		list: pass an empty array, will contain a flat list of all converte THREE.Bones

		returns the root THREE.Bone
	*/
  function toTHREEBone(source, list) {
    const bone = new THREE.Bone();
    list.push(bone);
    bone.position.add(source.offset);
    bone.name = source.name;

    if (source.type !== 'ENDSITE') {
      for (let i = 0; i < source.children.length; i += 1) {
        bone.add(toTHREEBone(source.children[i], list));
      }
    }

    return bone;
  }

  /*
		traverses the node hierarchy and builds a flat list of nodes
  */
  function flatten(bone, flatList) {
    flatList.push(bone);

    if (bone.type !== 'ENDSITE') {
      for (let i = 0; i < bone.children.length; i += 1) {
        flatten(bone.children[i], flatList);
      }
    }
  }

  /*
		builds a THREE.AnimationClip from the keyframe data saved in the bone.

		bone: bvh root node

		returns: a THREE.AnimationClip containing position and quaternion tracks
	*/
  function toTHREEAnimation(bone) {
    const bones = [];
    flatten(bone, bones);

    const tracks = [];

    // create a position and quaternion animation track for each node
    for (let i = 0; i < bones.length; i += 1) {
      const b = bones[i];

      if (b.type === 'ENDSITE') continue;

      // track data
      const times = [];
      const positions = [];
      const rotations = [];

      for (let j = 0; j < b.frames.length; j += 1) {
        const f = b.frames[j];
        times.push(f.time);
        positions.push(f.position.x + b.offset.x);
        positions.push(f.position.y + b.offset.y);
        positions.push(f.position.z + b.offset.z);

        rotations.push(f.rotation.x);
        rotations.push(f.rotation.y);
        rotations.push(f.rotation.z);
        rotations.push(f.rotation.w);
      }

      tracks.push(
        new THREE.VectorKeyframeTrack(
          `.bones[${b.name}].position`,
          times,
          positions
        )
      );

      tracks.push(
        new THREE.QuaternionKeyframeTrack(
          `.bones[${b.name}].quaternion`,
          times,
          rotations
        )
      );
    }

    const clip = new THREE.AnimationClip('animation', -1, tracks);

    return clip;
  }

  /*
		converts a bvh skeletal animation definition to THREE.Bones
		and a THREE.AnimationClip

		bone: bvh bone hierarchy including keyframe data (as produced by BVHImport.readBvh)

		returns an object containing a THREE.Skeleton and a THREE.AnimationClip
		({ skeleton: THREE.Skeleton, clip: THREE.AnimationClip })
	*/
  this.toTHREE = bone => {
    const threeBones = [];
    toTHREEBone(bone, threeBones);

    return {
      skeleton: new THREE.Skeleton(threeBones),
      clip: toTHREEAnimation(bone)
    };
  };

  /*
	 Recursively parses the HIERACHY section of the BVH file

	 - lines: all lines of the file. lines are consumed as we go along.
	 - firstline: line containing the node type and name e.g. "JOINT hip"
	 - list: collects a flat list of nodes

	 returns: a BVH node including children
	*/
  function readNode(lines, firstline, list) {
    const node = { name: '', type: '', frames: [] };
    list.push(node);

    // parse node tpye and name.
    let tokens = firstline.trim().split(/[\s]+/);

    if (
      tokens[0].toUpperCase() === 'END' &&
      tokens[1].toUpperCase() === 'SITE'
    ) {
      node.type = 'ENDSITE';
      node.name = 'ENDSITE'; // bvh end sites have no name
    } else {
      node.name = tokens[1];
      node.type = tokens[0].toUpperCase();
    }

    // opening bracket
    if (lines.shift().trim() !== '{')
      throw new Error('Expected opening { after type & name');

    // parse OFFSET
    tokens = lines
      .shift()
      .trim()
      .split(/[\s]+/);

    if (tokens[0].toUpperCase() !== 'OFFSET')
      throw new Error(`Expected OFFSET, but got: ${tokens[0]}`);
    if (tokens.length !== 4)
      throw new Error('OFFSET: Invalid number of values');

    const offset = {
      x: parseFloat(tokens[1]),
      y: parseFloat(tokens[2]),
      z: parseFloat(tokens[3])
    };

    if (isNaN(offset.x) || isNaN(offset.y) || isNaN(offset.z))
      throw new Error('OFFSET: Invalid values');

    node.offset = offset;

    // parse CHANNELS definitions
    if (node.type !== 'ENDSITE') {
      tokens = lines
        .shift()
        .trim()
        .split(/[\s]+/);

      if (tokens[0].toUpperCase() !== 'CHANNELS')
        throw new Error('Expected CHANNELS definition');

      const numChannels = parseInt(tokens[1], 10);
      node.channels = tokens.splice(2, numChannels);
      node.children = [];
    }

    // read children
    while (true) {
      const line = lines.shift().trim();

      if (line === '}') {
        return node;
      }
      node.children.push(readNode(lines, line, list));
    }
  }

  function readFrameData(data, frameTime, bone) {
    if (bone.type === 'ENDSITE')
      // end sites have no motion data
      return;

    // add keyframe
    const keyframe = {
      time: frameTime,
      position: { x: 0, y: 0, z: 0 },
      rotation: new THREE.Quaternion()
    };

    bone.frames.push(keyframe);

    // parse values for each channel in node
    for (let i = 0; i < bone.channels.length; i += 1) {
      const quat = new THREE.Quaternion();

      switch (bone.channels[i]) {
        case 'Xposition':
          keyframe.position.x = parseFloat(data.shift().trim());
          break;

        case 'Yposition':
          keyframe.position.y = parseFloat(data.shift().trim());
          break;

        case 'Zposition':
          keyframe.position.z = parseFloat(data.shift().trim());
          break;

        case 'Xrotation':
          quat.setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            (parseFloat(data.shift().trim()) * Math.PI) / 180
          );
          keyframe.rotation.multiply(quat);
          break;

        case 'Yrotation':
          quat.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            (parseFloat(data.shift().trim()) * Math.PI) / 180
          );
          keyframe.rotation.multiply(quat);
          break;

        case 'Zrotation':
          quat.setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            (parseFloat(data.shift().trim()) * Math.PI) / 180
          );
          keyframe.rotation.multiply(quat);
          break;

        default:
          throw new Error('invalid channel type');
      }
    }

    // parse child nodes
    for (let i = 0; i < bone.children.length; i += 1) {
      readFrameData(data, frameTime, bone.children[i]);
    }
  }

  /*
		reads a BVH file
	*/
  this.readBvh = lines => {
    // read model structure
    if (
      lines
        .shift()
        .trim()
        .toUpperCase() !== 'HIERARCHY'
    )
      throw new Error('HIERARCHY expected');

    const list = [];
    const root = readNode(lines, lines.shift().trim(), list);

    // read motion data
    if (
      lines
        .shift()
        .trim()
        .toUpperCase() !== 'MOTION'
    )
      throw new Error('MOTION  expected');

    let tokens = lines
      .shift()
      .trim()
      .split(/[\s]+/);

    // number of frames
    const numFrames = parseInt(tokens[1], 10);
    if (isNaN(numFrames)) throw new Error('Failed to read number of frames.');

    // frame time
    tokens = lines
      .shift()
      .trim()
      .split(/[\s]+/);
    const frameTime = parseFloat(tokens[2]);
    if (isNaN(frameTime)) throw new Error('Failed to read frame time.');

    // read frame data line by line
    for (let i = 0; i < numFrames; i += 1) {
      tokens = lines
        .shift()
        .trim()
        .split(/[\s]+/);

      readFrameData(tokens, i * frameTime, root, list);
    }

    return root;
  };

  /*
		 Recursively reads data from a single frame into the bone hierarchy.
		 The bone hierarchy has to be structured in the same order as the BVH file.
		 keyframe data is stored in bone.frames.

		 - data: splitted string array (frame values), values are shift()ed so
		 this should be empty after parsing the whole hierarchy.
		 - frameTime: playback time for this keyframe.
		 - bone: the bone to read frame data from.
	*/
})();

export default BvhHelper;
