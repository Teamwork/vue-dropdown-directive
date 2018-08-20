import {
  collocateElementAt,
  getAvailableCollocations,
  getRequestedCollocation,
} from '../../src/collocateElement.utility';

const allAvailableCollocations = [
  { position: 'top', alignment: 'left', available: false },
  { position: 'top', alignment: 'center', available: false },
  { position: 'top', alignment: 'right', available: false },
  { position: 'bottom', alignment: 'left', available: false },
  { position: 'bottom', alignment: 'center', available: false },
  { position: 'bottom', alignment: 'right', available: false },
  { position: 'left', alignment: 'top', available: false },
  { position: 'left', alignment: 'center', available: false },
  { position: 'left', alignment: 'bottom', available: false },
  { position: 'right', alignment: 'top', available: false },
  { position: 'right', alignment: 'center', available: false },
  { position: 'right', alignment: 'bottom', available: false },
];

describe('collocateElementAt Utility', () => {
  it('should not collocate the element', () => {
    expect(collocateElementAt()).toBe(false);
    expect(collocateElementAt({})).toBe(false);
  });
});

describe('getAvailableCollocations Utility', () => {
  it('should return all the available collocations', () => {
    expect(getAvailableCollocations()).toStrictEqual(allAvailableCollocations);
  });
  it('should return the collocations without top position', () => {
    const filterPositions = ({ position }) => position !== 'top';
    const filteredCollocations = allAvailableCollocations.filter(filterPositions);
    const allowedCollocations = { allowTopCollocation: false };
    expect(getAvailableCollocations(allowedCollocations)).toStrictEqual(filteredCollocations);
  });
  it('should return the collocations without top and bottom position', () => {
    const filterPositions = ({ position }) => position !== 'top' && position !== 'bottom';
    const filteredCollocations = allAvailableCollocations.filter(filterPositions);
    const allowedCollocations = {
      allowTopCollocation: false,
      allowBottomCollocation: false,
    };
    expect(getAvailableCollocations(allowedCollocations)).toStrictEqual(filteredCollocations);
  });
  it('should return only the right collocation', () => {
    const filterPositions = ({ position }) => position !== 'top' && position !== 'bottom' && position !== 'left';
    const filteredCollocations = allAvailableCollocations.filter(filterPositions);
    const allowedCollocations = {
      allowTopCollocation: false,
      allowBottomCollocation: false,
      allowLeftCollocation: false,
    };
    expect(getAvailableCollocations(allowedCollocations)).toStrictEqual(filteredCollocations);
  });
  it('should not return any collocations', () => {
    const allowedCollocations = {
      allowTopCollocation: false,
      allowBottomCollocation: false,
      allowLeftCollocation: false,
      allowRightCollocation: false,
    };
    expect(getAvailableCollocations(allowedCollocations)).toStrictEqual([]);
  });
});

describe('getRequestedCollocation Utility', () => {
  it('should return the default collocation', () => {
    expect(getRequestedCollocation()).toStrictEqual({
      position: 'bottom',
      alignment: 'center',
    });
  });
  it('should return a collocation at default position', () => {
    const modifiers = { top: true };
    expect(getRequestedCollocation(modifiers)).toStrictEqual({
      position: 'bottom',
      alignment: 'top',
    });
  });
  it('should return a valid collocation', () => {
    const modifiers = {
      left: true,
      top: true,
    };
    expect(getRequestedCollocation(modifiers)).toStrictEqual({
      position: 'left',
      alignment: 'top',
    });
  });
});
