import React from 'react';
import PropTypes from 'prop-types';

function StickFigure({ setRef }) {
  return (
    <skinnedMesh ref={setRef} position={[0, 0, 0]}>
      <geometry attach='geometry' />
      <meshPhongMaterial attach='material' skinning />
    </skinnedMesh>
  );
}

StickFigure.propTypes = {
  setRef: PropTypes.objectOf(PropTypes.any)
};

StickFigure.defaultProps = {
  setRef: {}
};

export default StickFigure;
