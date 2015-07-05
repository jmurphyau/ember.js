import Ember from 'ember-metal/core';
import isEnabled from 'ember-metal/features';
import Stream from 'ember-metal/streams/stream';
import { labelFor } from 'ember-metal/streams/utils';
import { read, isStream } from 'ember-metal/streams/utils';
import merge from 'ember-metal/merge';
import subscribe from 'ember-htmlbars/utils/subscribe';
import isNone from 'ember-metal/is_none';

if (isEnabled('ember-htmlbars-get-helper')) {

  const applyValue = function applyValue(morph, value) {
    if (morph.lastValue !== value) {
      morph.setContent(value);
      morph.lastValue = value;
    }
  };

  const buildStream = function buildStream(params) {
    const [objRef, pathRef] = params;

    Ember.assert('The first argument to {{get}} must be a stream', isStream(objRef));
    Ember.assert('{{get}} requires at least two arguments', params.length > 1);

    var getStream = new GetStream(objRef, pathRef);

    getStream.addDependency(objRef);
    getStream.addDependency(pathRef);

    return getStream;
  };

  var getKeyword = {
    subexprRender(env, scope, params, hash) {
      const stream = buildStream(params);

      // read the stream to activate it?
      env.hooks.getValue(stream);

      return stream;
    },
    setupState(state, env, scope, params, hash) {
      if (!state.isSetup) {
        const [objRef, pathRef] = params;
        const [obj, path] = [read(objRef), read(pathRef)];

        if (!isNone(obj) && !isNone(path)) {
          state.stream = buildStream(params);
          state.isSetup = true;
        }
      }

      return state;
    },
    isEmpty(state, env, scope, params, hash) {
      if (!state.isSetup) {
        return true;
      }

      const value = env.hooks.getValue(state.stream);
      return isNone(value) || value === '';
    },
    render(morph, env, scope, params, hash, template, inverse, visitor) {
      const { stream } = morph.state;

      // subscribe the morph to the getStream
      subscribe(morph, env, scope, stream);

      // subscribe the morph to the params/hash
      env.hooks.linkRenderNode(morph, env, scope, null, params, hash);

      // make sure the stream is active after subscribing
      // and get the value
      const value = env.hooks.getValue(stream);

      applyValue(morph, value);

      return true;
    },
    isStable(state, env, scope, params, hash) {
      return true;
    },
    rerender(morph, env, scope, params, hash, template, inverse, visitor) {
      const { stream } = morph.state;
      const value = env.hooks.getValue(stream);

      applyValue(morph, value);

      return true;
    }
  };

  var GetStream = function GetStream(obj, path) {
    this.init('(get '+labelFor(obj)+' '+labelFor(path)+')');

    this.objectParam = obj;
    this.pathParam = path;
    this.valueDep = this.addMutableDependency();
  };

  GetStream.prototype = Object.create(Stream.prototype);

  merge(GetStream.prototype, {
    updateValueDependency() {
      var pathValue = read(this.pathParam);

      if (this.lastPathValue !== pathValue) {
        if (typeof pathValue === 'string') {
          this.valueDep.replace(this.objectParam.get(pathValue));
        } else {
          this.valueDep.replace();
        }

        this.lastPathValue = pathValue;
      }
    },

    compute() {
      this.updateValueDependency();
      return this.valueDep.getValue();
    },

    setValue(value) {
      this.updateValueDependency();
      this.valueDep.setValue(value);
    }

  });

}

export default getKeyword;
