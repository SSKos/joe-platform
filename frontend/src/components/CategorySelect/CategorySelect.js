import React, { useState } from 'react';
import Select from 'react-select';
import categories from '../../categories.js';


const formatOptionLabel = (option, { context }) => context === 'value' ? `${option.value} - ${option.label}` : option.label;
const customStyles = {
  control: (provided) => ({
    ...provided,
    // width: '300px', // Adjust the width of the select control
  }),
  menu: (provided) => ({
    ...provided,
    // width: '300px', // Adjust the width of the dropdown menu
  }),
  group: (provided) => ({
    ...provided,
    fontSize: '12px',
    lineHeight: '10px',
    // color: 'blue', // Change the color of group labels
  }),
};

function CategorySelect(props) {
  const [selectedOption, setSelectedOption] = useState(null);

  function handleChange(event) {
    setSelectedOption(event)
    props.onCategoryChange (event);
  };

  return (
    <div>
      <label className="article-submit__label">Field of Science (we recommend 2 - 5)
        <Select
          styles={customStyles}
          formatOptionLabel={formatOptionLabel}
          className="article-submit__input"
          value={selectedOption}
          onChange={handleChange}
          options={categories}
          isMulti
          isSearchable
          placeholder="Start typing to select a field..."
        />
      </label>
    </div>
  );
};

export default CategorySelect;
