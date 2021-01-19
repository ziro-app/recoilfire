import { atom, selector } from 'recoil';

const filterBooleanValue = atom<boolean>({
  key: 'filterBooleanValue',
  default: true
});

const filterStringValue = selector<string>({
  key: 'filterStringValue',
  get: ({ get }) =>
    get(filterBooleanValue) ? 'includeInactives' : 'excludeInactives'
});

export { filterBooleanValue, filterStringValue };
