import React from 'react';

const HeadingBlock = ({ text }) => {
  return (
    <h2 className="text-3xl font-bold text-gray-800 mt-8 mb-4 border-b pb-2">
      {text}
    </h2>
  );
};

export default HeadingBlock;