import React from "react";
import Select from "react-select";
import { FixedSizeList as List } from "react-window";

// Custom component to virtualize the dropdown options
const VirtualizedSelect = ({ options, ...props }) => {
  const height = 35; // Height of each option
  const itemCount = options.length; // Number of options
  const itemSize = height; // Size of each option

  const Row = ({ index, style }) => (
    <div style={style}>{options[index].label}</div>
  );

  return (
    <Select
      {...props}
      options={options}
      menuPortalTarget={document.body} // Ensure the dropdown renders outside its container
      menuShouldScrollIntoView={false} // Prevent automatic scrolling when dropdown is open
      components={{
        MenuList: (props) => (
          <List
            height={Math.min(400, itemCount * height)} // Set a max height
            itemCount={itemCount}
            itemSize={itemSize}
            width="100%" // Ensure full width
          >
            {Row}
          </List>
        ),
      }}
    />
  );
};

// // Usage
// const sideOptionNumber = Array.from({ length: 1000 }, (_, i) => ({
//   label: `Option ${i + 1}`,
//   value: i + 1,
// }));

// const App = () => {
//   return (
//     <div style={{ width: "300px", margin: "auto" }}>
//       <VirtualizedSelect options={sideOptionNumber} />
//     </div>
//   );
// };

export default VirtualizedSelect;
