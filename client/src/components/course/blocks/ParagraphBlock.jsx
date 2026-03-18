import React from 'react';

const ParagraphBlock = ({ text }) => {
  return (
    <p className="text-gray-700 leading-relaxed text-lg my-2">
      {text}
    </p>
  );
};

export default ParagraphBlock;