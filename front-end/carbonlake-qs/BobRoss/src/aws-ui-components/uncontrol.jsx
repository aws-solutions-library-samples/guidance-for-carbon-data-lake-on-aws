import React, { useState } from 'react';

export default (Component, handler, prop, changeDetail) => {
  return props => {
    if (props[handler]) return <Component {...props} />;
    const [value, setValue] = useState(props[prop]);
    return (
      <Component
        {...props}
        {...{
          [prop]: value,
          [handler]: ({ detail }) => setValue(detail[changeDetail || prop])
        }}
      />
    );
  };
};
