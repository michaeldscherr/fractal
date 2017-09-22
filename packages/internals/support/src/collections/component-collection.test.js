/* eslint no-unused-expressions: "off" */

const {expect} = require('../../../../../test/helpers');
const File = require('../entities/file');
const Component = require('../entities/component');
const Collection = require('./collection');

const ComponentCollection = require('./component-collection');

let items = [{
  name: 'mickey',
  path: '/characters/mice/mickey',
  config: {
    disney: true,
    type: 'mouse'
  }
},
{
  name: 'jerry',
  path: '/characters/mice/jerry',
  config: {
    disney: false,
    type: 'mouse'
  }
},
{
  name: 'mighty',
  path: '/characters/mice/mighty',
  config: {
    disney: false,
    type: 'mouse'
  }
},
{
  name: 'pluto',
  path: '/characters/dogs/pluto',
  config: {
    disney: true,
    type: 'dog'
  }
},
{
  name: 'odie',
  path: '/characters/dogs/odie',
  config: {
    disney: false,
    type: 'dog'
  }
},
{
  name: 'jerry',
  path: '/characters/dogs/jerry',
  config: {
    disney: false,
    type: 'dog'
  }
}
];

const makeComponent = input => new Component({
  src: new File({path: input.path, cwd: '/'}),
  config: Object.assign({}, {name: input.name}, input.config)});

items = items.map(makeComponent);

const makeCollection = input => new ComponentCollection(input || items.slice(0));
const makeCollectionFrom = input => ComponentCollection.from(input || items.slice(0));

describe('ComponentCollection', function () {
  describe('constructor', function () {
    it('returns a new instance with correctly inherited properties', function () {
      const collection = new ComponentCollection();
      expect(collection).to.exist;
      expect(Collection.isCollection(collection)).to.equal(true);
      expect(collection.length).to.equal(0);
    });
  });
  describe('.from()', function () {
    it('successfully creates a FileCollection when valid input is supplied', function () {
      expect(() => makeCollectionFrom('text')).to.throw(TypeError, '[properties-invalid]');
      expect(() => makeCollectionFrom({invalid: 'object'})).to.throw(TypeError, '[properties-invalid]');
      expect(() => makeCollectionFrom({src: new File({path: 'valid-file-props/', cwd: '/'})})).to.not.throw();
      expect(() => makeCollectionFrom(new Component({src: new File({path: 'path', cwd: '/'})}))).to.not.throw();
      expect(() => makeCollectionFrom([Component.from({invalid: 'object'}), Component.from({anotherInvalid: 'object'})])).to.throw(TypeError, '[properties-invalid]');
      expect(() => makeCollectionFrom([Component.from({src: new File({path: 'valid-file-props1/', cwd: '/'})}), Component.from({src: new File({path: 'valid-file-props2/', cwd: '/'})})])).to.not.throw();
    });
  });

  describe('.find()', function () {
    it(`can be called with a single string argument to find the 'name'`, function () {
      const collection = makeCollection();
      expect(collection.find('mickey')).to.equal(items[0]);
    });
    it(`defers to its superclass for all other 'find' arguments`, function () {
      const collection = makeCollection();
      expect(collection.find('name', 'odie')).to.equal(items[4]);
      expect(collection.find({
        type: 'dog'
      })).to.equal(items[3]);

      expect(collection.find({
        name: 'mickey',
        disney: false
      })).to.equal(undefined);
      expect(collection.find(i => i.name === 'mickey')).to.equal(items[0]);
    });
  });

  describe(`.filterByPath()`, function () {
    it('returns a collection instance', function () {
      const collection = makeCollection();
      const newCollection = collection.filterByPath('*');
      expect(ComponentCollection.isCollection(newCollection));
      expect(newCollection instanceof ComponentCollection).to.equal(true);
    });

    it(`filters based on a glob string argument for the 'component/path'`, function () {
      const collection = makeCollection();
      expect(collection.filterByPath('*/dogs/jerry').count()).to.equal(1);
    });
  });

  describe(`.rejectByPath()`, function () {
    it('returns a collection instance', function () {
      const collection = makeCollection();
      const newCollection = collection.rejectByPath('*');
      expect(ComponentCollection.isCollection(newCollection));
      expect(newCollection instanceof ComponentCollection).to.equal(true);
    });

    it(`rejects based on a glob string argument for the 'component/path'`, function () {
      const collection = makeCollection();
      expect(collection.rejectByPath('*/dogs/jerry').count()).to.equal(items.length - 1);
    });
  });

  describe(`.toJSON()`, function () {
    it(`calls to the 'toJSON' method of each item in the collection`, function () {
      const collection = makeCollection();
      expect(collection.toJSON()).to.eql(items.map(item => item.toJSON()));
    });
  });

  describe('.from()', function () {
    it('returns a ComponentCollection instance', function () {
      const collection = ComponentCollection.from(items);
      expect(collection instanceof ComponentCollection).to.equal(true);
    });
  });

  describe('[Symbol.toStringTag]', function () {
    it('should resolve correctly', function () {
      const collection = makeCollection();
      expect(collection[Symbol.toStringTag]).to.equal('ComponentCollection');
    });
  });
});