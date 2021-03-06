// tests for module runner

// stores info for tests

var __moduleRunnerMockData = {

  HTML: '',

  moduleOne: function(obj) {
    this.int1 = 33;
    this.int2 = 55;

    obj.innerHTML = obj.innerHTML + '<p>Module One.</p>';
  },

  nested: {
    moduleTwo: FlatJS.Classy.extend({
      init: function(obj) {
        this.int1 = 23;
        this.int2 = 89;

        obj.innerHTML = obj.innerHTML + '<p>Module Two.</p>';
      }
    }),
  },

  basicImplentationTests: function(mock, obj2, nodeSet) {
      QUnit.ok(mock.fjsComponents, "fjsComponents array attaches to <div> on init, init runs by default, works without provided scope");
      QUnit.ok(mock.fjsComponents[!nodeSet ? '__moduleRunnerMockData.moduleOne' : 'moduleOne'] instanceof __moduleRunnerMockData.moduleOne, "moduleOne module executed on div, retrieves object and is instance of __moduleRunnerMockData.moduleOne");

      QUnit.ok(obj2.fjsComponents, "jsModules array attaches to <div> on inner <div> recursively");

      QUnit.ok(obj2.fjsComponents[!nodeSet ? '__moduleRunnerMockData.nested.moduleTwo' : 'nested.moduleTwo'] instanceof __moduleRunnerMockData.nested.moduleTwo, "moduleTwo is assigned appropriately to inner <div>");
      QUnit.equal(obj2.fjsComponents[!nodeSet ? '__moduleRunnerMockData.nested.moduleTwo' : 'nested.moduleTwo'].int1, 23, "reference to inner object returns correctly set variable retrieved from data attribute");
  }

}

$.ajax({

  url: 'Runner/mock.html',
  success: function(data) {
    __moduleRunnerMockData.HTML = data;
    $('#mock-area').append(data);
    __moduleRunnerMockData.mockLoadedCallback()
  }

})

__moduleRunnerMockData.mockLoadedCallback = function() {

  QUnit.test("FlatJS.Runner default functionality", function(assert) {

    var $mock = $('#module-runner-test-mock'),
        $two  = $mock.find('.module-two'),
        mock  = $mock.get(0),
        obj2  = $two.get(0);

    var runner = new FlatJS.Runner();

    QUnit.ok($('#module-runner-test-mock').length > 0, "Module runner mock HTML loads and appends via ajax");

    __moduleRunnerMockData.basicImplentationTests(mock, obj2);

  });

  // reset
  QUnit.test('FlatJS.Runner - extended functionality', function(assert) {

    var $mock = $('#module-runner-test-mock');

    //reset
    $mock.remove();
    $('#mock-area').append(__moduleRunnerMockData.HTML);

    var $mock = $('#module-runner-test-mock'),
        $two  = $mock.find('.module-two'),
        mock  = $mock.get(0),
        obj2  = $two.get(0);

    // edit attributes
    $mock.attr('data-new-js-module', 'module-one');
    $two.attr('data-new-js-module', 'nested.module-two');

    var runner = new FlatJS.Runner({
      init:    false,
      context: __moduleRunnerMockData,
      attr:    'data-new-js-module',
      node:    mock
    })

    QUnit.equal(obj2.jsModules, undefined, "Runner does not automatically init if false flag is passed");

    runner.init();

    __moduleRunnerMockData.basicImplentationTests(mock, obj2, true);

    $mock.remove();

  });

}
