import React from 'react';
import { useRecoilState } from 'recoil';
import { filterBooleanValue } from '../../atoms';

const FilterTeam: React.FC = () => {
  const [filter, setFilter] = useRecoilState(filterBooleanValue);
  const updateFilter = event => setFilter(event.target.checked);
  return (
    <>
      <input
        type='checkbox'
        onChange={updateFilter}
        id='active/inactive'
        checked={filter}
      />
      <label htmlFor='active/inactive'>Incluir inativos</label>
    </>
  );
};

export default FilterTeam;
