var FlatJS = FlatJS || {};

FlatJS.MV = FlatJS.Widget.extend(function() {

  var api = {

    render: function() {
      this._(internalInitializer)();
      this.initializer();
      this._(findAndInitializeModels)();
      this._(syncMVKeys)();
      this._(assembleJSON)();
      this.renderUI();
      this.syncUI();
      this._(bindMVKeys)();
      this.bindUI();
    }

  };

  function internalInitializer() {
    this.JSON = this.JSON || {};
  }

  function findAndInitializeModels() {
    var modelNodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-model', this.obj);

    for (var i = 0; i < modelNodes.length; i++) {
      var node      = modelNodes[i],
          modelName = node.getAttribute('data-mv-model'),
          model     = FlatJS.Helpers.findFunctionByString(modelName, window, FlatJS.Object.extend({}));

      this._(createModelObjectFromNode)(model, node, modelName);
    }
  }

  function createModelObjectFromNode(model, node, modelName) {
    var id     = node.getAttribute('data-mv-id'),
        obj    = false;

    obj = model.find(id) || new model({ id: id });

    obj.nodes     = obj.nodes || [];
    obj.modelName = obj.modelName || modelName;

    this._(stripDataFromNodeAndUpdateObject)(obj, node);
  }

  function stripDataFromNodeAndUpdateObject(obj, node) {
    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child && child.hasAttribute && child.hasAttribute('data-mv-key')) {
        this._(getKeyAndValueFromNodeAndAddToObject)(obj, child);
      }

      if (child.childNodes && child.childNodes.length > 0) {
        if (child.hasAttribute && !child.hasAttribute('data-mv-model')) {
          this._(stripDataFromNodeAndUpdateObject)(obj, child);
        }
      }
    }
  }

  function getKeyAndValueFromNodeAndAddToObject(obj, node) {
    var key = node.getAttribute('data-mv-key'),
        val = node.innerHTML;

    node.object = obj;
    obj.nodes.push(node);
    obj.set(key, val);
  }

  function syncMVKeyOnObjectChange(prop, oldVal, newVal, obj) {
    for (var i = 0; i < obj.nodes.length; i++) {
      var node = obj.nodes[i];

      if (node && node.getAttribute('data-mv-key') && node.getAttribute('data-mv-key') === prop) {
        node.innerHTML = newVal;
      }
    }
  }

  function syncMVKeys() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-key', this.obj);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i],
          attr = node.object[node.getAttribute('data-mv-key')];
      if (attr) {
        node.innerHTML = attr;
      }
    }
  }

  function bindMVKeys() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-key', this.obj);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if (!node.object._FJSwatchSet) {
        node.object._FJSwatchSet = true;
        node.object.watch(node.getAttribute('data-mv-key'), this._(syncMVKeyOnObjectChange));
      }
    }
  }

  function assembleJSON(parentObj, node) {
    var children  = node ? node.childNodes : this.obj.childNodes,
        parentObj = parentObj || this.JSON;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        var model = child.hasAttribute('dava-mv-model');

        if (child.hasAttribute('data-json-key')) {
          var key = child.getAttribute('data-json-key');

          parentObj[key] = child.innerHTML;
        } else if (child.hasAttribute('data-json-obj') ||
                   child.hasAttribute('data-json-array')) {
          if (child.childNodes && child.childNodes.length > 0) {
            var isObj = child.hasAttribute('data-json-obj'),
                key   = child.getAttribute(isObj ? 'data-json-obj' : 'data-json-array');
            parentObj[key] = isObj ? {} : [];
            this._(assembleJSON)(parentObj[key], child);
          }
        }
      }
    }
  }

  return api;

});
