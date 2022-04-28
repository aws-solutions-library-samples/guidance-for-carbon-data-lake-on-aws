import React, { useState } from 'react';
import { AttributeEditor } from '@amzn/awsui-components-react';

export default props => {
  const [items, setItems] = useState(props.items || []);

  return (
    <AttributeEditor
      {...props}
      onAddButtonClick={() => setItems([...items, {}])}
      onRemoveButtonClick={({ detail: { itemIndex } }) => {
        const tmpItems = [...items];
        tmpItems.splice(itemIndex, 1);
        setItems(tmpItems);
      }}
      items={items}
    />
  );
};
