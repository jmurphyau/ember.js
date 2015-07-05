import Ember from 'ember-metal/core';
import isEnabled from 'ember-metal/features';
import EmberView from 'ember-views/views/view';
import Registry from 'container/registry';
import jQuery from 'ember-views/system/jquery';
import compile from 'ember-template-compiler/system/compile';
import ComponentLookup from 'ember-views/component_lookup';
import Component from 'ember-views/views/component';
import { runAppend, runDestroy } from 'ember-runtime/tests/utils';
import { get } from 'ember-metal/property_get';
import { set } from 'ember-metal/property_set';
import run from 'ember-metal/run_loop';

var registry, container, view;

function commonSetup() {
  registry = new Registry();
  container = registry.container();
  registry.optionsForType('component', { singleton: false });
  registry.optionsForType('view', { singleton: false });
  registry.optionsForType('template', { instantiate: false });
  registry.register('component-lookup:main', ComponentLookup);
}

function commonTeardown() {
  runDestroy(container);
  runDestroy(view);
  registry = container = view = null;
}

function appendViewFor(template, hash={}) {
  let view = EmberView.extend({
    template: compile(template),
    container: container
  }).create(hash);

  runAppend(view);

  return view;
}

QUnit.module('!! GET 2 TEST', {
  setup() {
    commonSetup();
  },

  teardown() {
    commonTeardown();
  }
});

QUnit.test('non-block without properties', function() {
  expect(1);

  registry.register('template:components/non-block', compile('In layout'));

  view = EmberView.extend({
    template: compile('{{non-block}}'),
    container: container
  }).create();

  runAppend(view);

  equal(jQuery('#qunit-fixture').text(), 'In layout');
});

QUnit.test('should be able to get an object value with a bound/dynamic key JAMESTEST', function() {
  registry.register('template:components/non-block', compile('[{{get colors key}}][{{get sounds soundKey}}]{{#if showSounds}}[{{get sounds soundKey}}][{{get colors key}}]{{/if}}'));

  var context = {
    colors: { apple: 'red', banana: 'yellow' },
    sounds: { dog: 'woof', cat: 'meow' },
    key: 'apple',
    soundKey: null,
    showSounds: false
  };

  view = EmberView.create({
    context: context,
    container: container,
    template: compile('{{non-block colors=colors sounds=sounds key=key soundKey=soundKey showSounds=showSounds}}')
  });

  console.log('1 --------------------');

  runAppend(view);

  equal(view.$().text(), '[red][]');

  console.log('2 --------------------');
  run(function() {
    view.set('context.colors.apple', 'green');
  });

  equal(view.$().text(), '[green][]');

  console.log('3 --------------------');
  run(function() {
    view.set('context.key', 'banana');
  });

  equal(view.$().text(), '[yellow][]');

  console.log('4 --------------------');
  run(function() {
    view.set('context.showSounds', true);
  });

  equal(view.$().text(), '[yellow][][][yellow]');

  console.log('5 --------------------');
  run(function() {
    view.set('context.soundKey', 'dog');
  });

  equal(view.$().text(), '[yellow][woof][woof][yellow]');

  console.log('6 --------------------');
  run(function() {
    view.set('context.showSounds', 2);
  });

  equal(view.$().text(), '[yellow][woof][woof][yellow]');

  console.log('7 --------------------');
  run(function() {
    view.set('context.showSounds', 3);
  });

  equal(view.$().text(), '[yellow][woof][woof][yellow]');

  console.log('8 --------------------');
  run(function() {
    view.set('context.colors.banana', null);
  });

  equal(view.$().text(), '[][woof][woof][]');

  console.log('9 --------------------');
  run(function() {
    view.set('context.colors.banana', 'blue');
  });

  equal(view.$().text(), '[blue][woof][woof][blue]');

  console.log('10 --------------------');
  run(function() {
    view.set('context.colors.banana', null);
  });

  equal(view.$().text(), '[][woof][woof][]');

  console.log('11 --------------------');
  run(function() {
    view.set('context.colors.apple', 'red');
  });

  equal(view.$().text(), '[][woof][woof][]');

  console.log('12 --------------------');
  run(function() {
    view.set('context.key', 'apple');
  });

  equal(view.$().text(), '[red][woof][woof][red]');

});

QUnit.test('should be able to get an object value with a bound/dynamic key JAMESTEST 2', function() {
  var context = {
    colors: Ember.Object.create({ apple: 'red', banana: 'yellow' }),
    sounds: Ember.Object.create({ dog: 'woof', cat: 'meow' }),
    key: 'apple',
    soundKey: null,
    showSounds: false
  };

  view = EmberView.create({
    context: context,
    container: container,
    template: compile('[{{get colors key}}][{{get sounds soundKey}}]{{#if showSounds}}[{{get sounds soundKey}}][{{get colors key}}]{{/if}}')
  });

  console.log('1 --------------------');

  runAppend(view);

  equal(view.$().text(), '[red][]');

  console.log('2 --------------------');
  run(function() {
    view.set('context.colors.apple', 'green');
  });

  equal(view.$().text(), '[green][]');

  console.log('3 --------------------');
  run(function() {
    view.set('context.key', 'banana');
  });

  equal(view.$().text(), '[yellow][]');

  console.log('4 --------------------');
  run(function() {
    view.set('context.showSounds', true);
  });

  equal(view.$().text(), '[yellow][][][yellow]');

  console.log('5 --------------------');
  run(function() {
    view.set('context.soundKey', 'dog');
  });

  equal(view.$().text(), '[yellow][woof][woof][yellow]');

  console.log('6 --------------------');
  run(function() {
    view.set('context.showSounds', 2);
  });

  equal(view.$().text(), '[yellow][woof][woof][yellow]');

  console.log('7 --------------------');
  run(function() {
    view.set('context.showSounds', 3);
  });

  equal(view.$().text(), '[yellow][woof][woof][yellow]');

  console.log('8 --------------------');
  run(function() {
    view.set('context.colors.banana', null);
  });

  equal(view.$().text(), '[][woof][woof][]');

  console.log('9 --------------------');
  run(function() {
    view.set('context.colors.banana', 'blue');
  });

  equal(view.$().text(), '[blue][woof][woof][blue]');

  console.log('10 --------------------');
  run(function() {
    view.set('context.colors.banana', null);
  });

  equal(view.$().text(), '[][woof][woof][]');

  console.log('11 --------------------');
  run(function() {
    view.set('context.colors.apple', 'red');
  });

  equal(view.$().text(), '[][woof][woof][]');

  console.log('12 --------------------');
  run(function() {
    view.set('context.key', 'apple');
  });

  equal(view.$().text(), '[red][woof][woof][red]');

  console.log('13 --------------------');
  run(function() {
    view.set('context.key', null);
  });

  equal(view.$().text(), '[][woof][woof][]');

  console.log('14 --------------------');
  run(function() {
    view.set('context.colors.apple', 'blue');
  });

  equal(view.$().text(), '[][woof][woof][]');

});

QUnit.test('should be able to get an object value with a bound/dynamic key JAMESTEST 3', function() {
  var context = {
    states: { left: false, right: false },
    colors: { apple: 'red', banana: 'yellow' },
    sounds: { dog: 'woof', cat: 'meow' },
    leftKey: 'apple',
    rightKey: 'dog'
  };

  view = EmberView.create({
    context: context,
    container: container,
    template: compile('[{{#if (get states \'left\')}}{{get colors leftKey}}{{/if}}] [{{#if (get states \'right\')}}{{get sounds rightKey}}{{/if}}]')
  });

  console.log('1 --------------------');
  runAppend(view);

  equal(view.$().text(), '[] []');

  console.log('2 --------------------');
  run(function() {
    view.set('context.states.left', true);
  });

  equal(view.$().text(), '[red] []');

});
