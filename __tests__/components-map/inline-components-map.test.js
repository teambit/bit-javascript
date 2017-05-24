import mockFs from 'mock-fs';
import { InlineComponentsMap } from '../../src/maps';

const bitJsonFixture = {
  sources: {
    impl: 'impl.js',
    misc: [],
  },
  env: {
    compiler: 'none',
    tester: 'none',
  },
  dependencies: {},
};

const bitJsonValuesFixture = Object.assign({}, bitJsonFixture);
bitJsonValuesFixture.dependencies = { 'bit.utils/object/foreach': '1' };

beforeEach(() => {
  mockFs({
    'my/project/.bit': {
      'scope.json': JSON.stringify({ name: 'project' }),
    },
    'my/project/components/compilers/flow/bit.envs/2': {
      'bit.json': JSON.stringify(bitJsonFixture),
    },
    'my/project/components/object/foreach/bit.utils/1': {
      'bit.json': JSON.stringify(bitJsonFixture),
    },
    'my/project/components/object/values/bit.utils/1': {
      'bit.json': JSON.stringify(bitJsonValuesFixture),
    },
    'my/project/components/global/is-number/project/1': {
      'bit.json': JSON.stringify(bitJsonFixture),
    },
    'my/project/inline_components/global/is-string': {},
  });
});

afterEach(() => {
  mockFs.restore();
});

describe('buildForInline', () => {
  it.only('this', () => {

  });
  // const projectBitJson = {
  //   impl: 'impl.js',
  //   spec: 'spec.js',
  //   misc: [],
  //   compiler: 'none',
  //   tester: 'none',
  //   dependencies: { 'bit.envs/compilers/flow': '2', 'bit.utils/object/values': '1' },
  // };
  // it('should create a map from inline_components directory', () => {
  //   const result = componentsMap.buildForInline('my/project/inline_components', projectBitJson);
  //   return result.then((map) => {
  //     expect(map).toEqual({ 'global/is-string': { compiler: 'none',
  //       file: 'impl.js',
  //       loc: 'global/is-string',
  //       dependencies: ['bit.envs/compilers/flow::2', 'bit.utils/object/values::1'],
  //     } });
  //   });
  // });
});
