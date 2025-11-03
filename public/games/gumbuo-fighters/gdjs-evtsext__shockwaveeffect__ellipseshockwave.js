
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave || {};

/**
 * Behavior generated from Ellipse shock wave
 */
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave = class EllipseShockWave extends gdjs.RuntimeBehavior {
  constructor(instanceContainer, behaviorData, owner) {
    super(instanceContainer, behaviorData, owner);
    this._runtimeScene = instanceContainer;

    this._onceTriggers = new gdjs.OnceTriggers();
    this._behaviorData = {};
    this._sharedData = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.getSharedData(
      instanceContainer,
      behaviorData.name
    );
    
    this._behaviorData.StartWidth = behaviorData.StartWidth !== undefined ? behaviorData.StartWidth : Number("8") || 0;
    this._behaviorData.StartHeight = behaviorData.StartHeight !== undefined ? behaviorData.StartHeight : Number("8") || 0;
    this._behaviorData.StartOutlineThickness = behaviorData.StartOutlineThickness !== undefined ? behaviorData.StartOutlineThickness : Number("16") || 0;
    this._behaviorData.StartColor = behaviorData.StartColor !== undefined ? behaviorData.StartColor : "255;217;154";
    this._behaviorData.StartOpacity = behaviorData.StartOpacity !== undefined ? behaviorData.StartOpacity : Number("255") || 0;
    this._behaviorData.StartAngle = behaviorData.StartAngle !== undefined ? behaviorData.StartAngle : Number("0") || 0;
    this._behaviorData.EndWidth = behaviorData.EndWidth !== undefined ? behaviorData.EndWidth : Number("256") || 0;
    this._behaviorData.EndHeight = behaviorData.EndHeight !== undefined ? behaviorData.EndHeight : Number("256") || 0;
    this._behaviorData.EndOutlineThickness = behaviorData.EndOutlineThickness !== undefined ? behaviorData.EndOutlineThickness : Number("0") || 0;
    this._behaviorData.EndColor = behaviorData.EndColor !== undefined ? behaviorData.EndColor : "255;217;154";
    this._behaviorData.EndOpacity = behaviorData.EndOpacity !== undefined ? behaviorData.EndOpacity : Number("0") || 0;
    this._behaviorData.EndAngle = behaviorData.EndAngle !== undefined ? behaviorData.EndAngle : Number("0") || 0;
    this._behaviorData.Duration = behaviorData.Duration !== undefined ? behaviorData.Duration : Number("1") || 0;
    this._behaviorData.Easing = behaviorData.Easing !== undefined ? behaviorData.Easing : "easeOutSine";
    this._behaviorData.IsFilled = behaviorData.IsFilled !== undefined ? behaviorData.IsFilled : false;
    this._behaviorData.Width = Number("") || 0;
    this._behaviorData.Height = Number("") || 0;
    this._behaviorData.Outline = Number("") || 0;
    this._behaviorData.Color = "";
    this._behaviorData.Rotation = Number("") || 0;
    this._behaviorData.CurrentWidth = Number("") || 0;
    this._behaviorData.CurrentHeight = Number("") || 0;
    this._behaviorData.CurrentOutline = Number("") || 0;
    this._behaviorData.CurrentOpacity = Number("") || 0;
    this._behaviorData.CurrentAngle = Number("") || 0;
    this._behaviorData.Progress = Number("0") || 0;
    this._behaviorData.EasedProgress = Number("0") || 0;
  }

  // Hot-reload:
  updateFromBehaviorData(oldBehaviorData, newBehaviorData) {
    
    if (oldBehaviorData.StartWidth !== newBehaviorData.StartWidth)
      this._behaviorData.StartWidth = newBehaviorData.StartWidth;
    if (oldBehaviorData.StartHeight !== newBehaviorData.StartHeight)
      this._behaviorData.StartHeight = newBehaviorData.StartHeight;
    if (oldBehaviorData.StartOutlineThickness !== newBehaviorData.StartOutlineThickness)
      this._behaviorData.StartOutlineThickness = newBehaviorData.StartOutlineThickness;
    if (oldBehaviorData.StartColor !== newBehaviorData.StartColor)
      this._behaviorData.StartColor = newBehaviorData.StartColor;
    if (oldBehaviorData.StartOpacity !== newBehaviorData.StartOpacity)
      this._behaviorData.StartOpacity = newBehaviorData.StartOpacity;
    if (oldBehaviorData.StartAngle !== newBehaviorData.StartAngle)
      this._behaviorData.StartAngle = newBehaviorData.StartAngle;
    if (oldBehaviorData.EndWidth !== newBehaviorData.EndWidth)
      this._behaviorData.EndWidth = newBehaviorData.EndWidth;
    if (oldBehaviorData.EndHeight !== newBehaviorData.EndHeight)
      this._behaviorData.EndHeight = newBehaviorData.EndHeight;
    if (oldBehaviorData.EndOutlineThickness !== newBehaviorData.EndOutlineThickness)
      this._behaviorData.EndOutlineThickness = newBehaviorData.EndOutlineThickness;
    if (oldBehaviorData.EndColor !== newBehaviorData.EndColor)
      this._behaviorData.EndColor = newBehaviorData.EndColor;
    if (oldBehaviorData.EndOpacity !== newBehaviorData.EndOpacity)
      this._behaviorData.EndOpacity = newBehaviorData.EndOpacity;
    if (oldBehaviorData.EndAngle !== newBehaviorData.EndAngle)
      this._behaviorData.EndAngle = newBehaviorData.EndAngle;
    if (oldBehaviorData.Duration !== newBehaviorData.Duration)
      this._behaviorData.Duration = newBehaviorData.Duration;
    if (oldBehaviorData.Easing !== newBehaviorData.Easing)
      this._behaviorData.Easing = newBehaviorData.Easing;
    if (oldBehaviorData.IsFilled !== newBehaviorData.IsFilled)
      this._behaviorData.IsFilled = newBehaviorData.IsFilled;
    if (oldBehaviorData.Width !== newBehaviorData.Width)
      this._behaviorData.Width = newBehaviorData.Width;
    if (oldBehaviorData.Height !== newBehaviorData.Height)
      this._behaviorData.Height = newBehaviorData.Height;
    if (oldBehaviorData.Outline !== newBehaviorData.Outline)
      this._behaviorData.Outline = newBehaviorData.Outline;
    if (oldBehaviorData.Color !== newBehaviorData.Color)
      this._behaviorData.Color = newBehaviorData.Color;
    if (oldBehaviorData.Rotation !== newBehaviorData.Rotation)
      this._behaviorData.Rotation = newBehaviorData.Rotation;
    if (oldBehaviorData.CurrentWidth !== newBehaviorData.CurrentWidth)
      this._behaviorData.CurrentWidth = newBehaviorData.CurrentWidth;
    if (oldBehaviorData.CurrentHeight !== newBehaviorData.CurrentHeight)
      this._behaviorData.CurrentHeight = newBehaviorData.CurrentHeight;
    if (oldBehaviorData.CurrentOutline !== newBehaviorData.CurrentOutline)
      this._behaviorData.CurrentOutline = newBehaviorData.CurrentOutline;
    if (oldBehaviorData.CurrentOpacity !== newBehaviorData.CurrentOpacity)
      this._behaviorData.CurrentOpacity = newBehaviorData.CurrentOpacity;
    if (oldBehaviorData.CurrentAngle !== newBehaviorData.CurrentAngle)
      this._behaviorData.CurrentAngle = newBehaviorData.CurrentAngle;
    if (oldBehaviorData.Progress !== newBehaviorData.Progress)
      this._behaviorData.Progress = newBehaviorData.Progress;
    if (oldBehaviorData.EasedProgress !== newBehaviorData.EasedProgress)
      this._behaviorData.EasedProgress = newBehaviorData.EasedProgress;

    return true;
  }

  // Network sync:
  getNetworkSyncData(syncOptions) {
    return {
      ...super.getNetworkSyncData(syncOptions),
      props: {
        
    StartWidth: this._behaviorData.StartWidth,
    StartHeight: this._behaviorData.StartHeight,
    StartOutlineThickness: this._behaviorData.StartOutlineThickness,
    StartColor: this._behaviorData.StartColor,
    StartOpacity: this._behaviorData.StartOpacity,
    StartAngle: this._behaviorData.StartAngle,
    EndWidth: this._behaviorData.EndWidth,
    EndHeight: this._behaviorData.EndHeight,
    EndOutlineThickness: this._behaviorData.EndOutlineThickness,
    EndColor: this._behaviorData.EndColor,
    EndOpacity: this._behaviorData.EndOpacity,
    EndAngle: this._behaviorData.EndAngle,
    Duration: this._behaviorData.Duration,
    Easing: this._behaviorData.Easing,
    IsFilled: this._behaviorData.IsFilled,
    Width: this._behaviorData.Width,
    Height: this._behaviorData.Height,
    Outline: this._behaviorData.Outline,
    Color: this._behaviorData.Color,
    Rotation: this._behaviorData.Rotation,
    CurrentWidth: this._behaviorData.CurrentWidth,
    CurrentHeight: this._behaviorData.CurrentHeight,
    CurrentOutline: this._behaviorData.CurrentOutline,
    CurrentOpacity: this._behaviorData.CurrentOpacity,
    CurrentAngle: this._behaviorData.CurrentAngle,
    Progress: this._behaviorData.Progress,
    EasedProgress: this._behaviorData.EasedProgress,
      }
    };
  }
  updateFromNetworkSyncData(networkSyncData, options) {
    super.updateFromNetworkSyncData(networkSyncData, options);
    
    if (networkSyncData.props.StartWidth !== undefined)
      this._behaviorData.StartWidth = networkSyncData.props.StartWidth;
    if (networkSyncData.props.StartHeight !== undefined)
      this._behaviorData.StartHeight = networkSyncData.props.StartHeight;
    if (networkSyncData.props.StartOutlineThickness !== undefined)
      this._behaviorData.StartOutlineThickness = networkSyncData.props.StartOutlineThickness;
    if (networkSyncData.props.StartColor !== undefined)
      this._behaviorData.StartColor = networkSyncData.props.StartColor;
    if (networkSyncData.props.StartOpacity !== undefined)
      this._behaviorData.StartOpacity = networkSyncData.props.StartOpacity;
    if (networkSyncData.props.StartAngle !== undefined)
      this._behaviorData.StartAngle = networkSyncData.props.StartAngle;
    if (networkSyncData.props.EndWidth !== undefined)
      this._behaviorData.EndWidth = networkSyncData.props.EndWidth;
    if (networkSyncData.props.EndHeight !== undefined)
      this._behaviorData.EndHeight = networkSyncData.props.EndHeight;
    if (networkSyncData.props.EndOutlineThickness !== undefined)
      this._behaviorData.EndOutlineThickness = networkSyncData.props.EndOutlineThickness;
    if (networkSyncData.props.EndColor !== undefined)
      this._behaviorData.EndColor = networkSyncData.props.EndColor;
    if (networkSyncData.props.EndOpacity !== undefined)
      this._behaviorData.EndOpacity = networkSyncData.props.EndOpacity;
    if (networkSyncData.props.EndAngle !== undefined)
      this._behaviorData.EndAngle = networkSyncData.props.EndAngle;
    if (networkSyncData.props.Duration !== undefined)
      this._behaviorData.Duration = networkSyncData.props.Duration;
    if (networkSyncData.props.Easing !== undefined)
      this._behaviorData.Easing = networkSyncData.props.Easing;
    if (networkSyncData.props.IsFilled !== undefined)
      this._behaviorData.IsFilled = networkSyncData.props.IsFilled;
    if (networkSyncData.props.Width !== undefined)
      this._behaviorData.Width = networkSyncData.props.Width;
    if (networkSyncData.props.Height !== undefined)
      this._behaviorData.Height = networkSyncData.props.Height;
    if (networkSyncData.props.Outline !== undefined)
      this._behaviorData.Outline = networkSyncData.props.Outline;
    if (networkSyncData.props.Color !== undefined)
      this._behaviorData.Color = networkSyncData.props.Color;
    if (networkSyncData.props.Rotation !== undefined)
      this._behaviorData.Rotation = networkSyncData.props.Rotation;
    if (networkSyncData.props.CurrentWidth !== undefined)
      this._behaviorData.CurrentWidth = networkSyncData.props.CurrentWidth;
    if (networkSyncData.props.CurrentHeight !== undefined)
      this._behaviorData.CurrentHeight = networkSyncData.props.CurrentHeight;
    if (networkSyncData.props.CurrentOutline !== undefined)
      this._behaviorData.CurrentOutline = networkSyncData.props.CurrentOutline;
    if (networkSyncData.props.CurrentOpacity !== undefined)
      this._behaviorData.CurrentOpacity = networkSyncData.props.CurrentOpacity;
    if (networkSyncData.props.CurrentAngle !== undefined)
      this._behaviorData.CurrentAngle = networkSyncData.props.CurrentAngle;
    if (networkSyncData.props.Progress !== undefined)
      this._behaviorData.Progress = networkSyncData.props.Progress;
    if (networkSyncData.props.EasedProgress !== undefined)
      this._behaviorData.EasedProgress = networkSyncData.props.EasedProgress;
  }

  // Properties:
  
  _getStartWidth() {
    return this._behaviorData.StartWidth !== undefined ? this._behaviorData.StartWidth : Number("8") || 0;
  }
  _setStartWidth(newValue) {
    this._behaviorData.StartWidth = newValue;
  }
  _getStartHeight() {
    return this._behaviorData.StartHeight !== undefined ? this._behaviorData.StartHeight : Number("8") || 0;
  }
  _setStartHeight(newValue) {
    this._behaviorData.StartHeight = newValue;
  }
  _getStartOutlineThickness() {
    return this._behaviorData.StartOutlineThickness !== undefined ? this._behaviorData.StartOutlineThickness : Number("16") || 0;
  }
  _setStartOutlineThickness(newValue) {
    this._behaviorData.StartOutlineThickness = newValue;
  }
  _getStartColor() {
    return this._behaviorData.StartColor !== undefined ? this._behaviorData.StartColor : "255;217;154";
  }
  _setStartColor(newValue) {
    this._behaviorData.StartColor = newValue;
  }
  _getStartOpacity() {
    return this._behaviorData.StartOpacity !== undefined ? this._behaviorData.StartOpacity : Number("255") || 0;
  }
  _setStartOpacity(newValue) {
    this._behaviorData.StartOpacity = newValue;
  }
  _getStartAngle() {
    return this._behaviorData.StartAngle !== undefined ? this._behaviorData.StartAngle : Number("0") || 0;
  }
  _setStartAngle(newValue) {
    this._behaviorData.StartAngle = newValue;
  }
  _getEndWidth() {
    return this._behaviorData.EndWidth !== undefined ? this._behaviorData.EndWidth : Number("256") || 0;
  }
  _setEndWidth(newValue) {
    this._behaviorData.EndWidth = newValue;
  }
  _getEndHeight() {
    return this._behaviorData.EndHeight !== undefined ? this._behaviorData.EndHeight : Number("256") || 0;
  }
  _setEndHeight(newValue) {
    this._behaviorData.EndHeight = newValue;
  }
  _getEndOutlineThickness() {
    return this._behaviorData.EndOutlineThickness !== undefined ? this._behaviorData.EndOutlineThickness : Number("0") || 0;
  }
  _setEndOutlineThickness(newValue) {
    this._behaviorData.EndOutlineThickness = newValue;
  }
  _getEndColor() {
    return this._behaviorData.EndColor !== undefined ? this._behaviorData.EndColor : "255;217;154";
  }
  _setEndColor(newValue) {
    this._behaviorData.EndColor = newValue;
  }
  _getEndOpacity() {
    return this._behaviorData.EndOpacity !== undefined ? this._behaviorData.EndOpacity : Number("0") || 0;
  }
  _setEndOpacity(newValue) {
    this._behaviorData.EndOpacity = newValue;
  }
  _getEndAngle() {
    return this._behaviorData.EndAngle !== undefined ? this._behaviorData.EndAngle : Number("0") || 0;
  }
  _setEndAngle(newValue) {
    this._behaviorData.EndAngle = newValue;
  }
  _getDuration() {
    return this._behaviorData.Duration !== undefined ? this._behaviorData.Duration : Number("1") || 0;
  }
  _setDuration(newValue) {
    this._behaviorData.Duration = newValue;
  }
  _getEasing() {
    return this._behaviorData.Easing !== undefined ? this._behaviorData.Easing : "easeOutSine";
  }
  _setEasing(newValue) {
    this._behaviorData.Easing = newValue;
  }
  _getIsFilled() {
    return this._behaviorData.IsFilled !== undefined ? this._behaviorData.IsFilled : false;
  }
  _setIsFilled(newValue) {
    this._behaviorData.IsFilled = newValue;
  }
  _toggleIsFilled() {
    this._setIsFilled(!this._getIsFilled());
  }
  _getWidth() {
    return this._behaviorData.Width !== undefined ? this._behaviorData.Width : Number("") || 0;
  }
  _setWidth(newValue) {
    this._behaviorData.Width = newValue;
  }
  _getHeight() {
    return this._behaviorData.Height !== undefined ? this._behaviorData.Height : Number("") || 0;
  }
  _setHeight(newValue) {
    this._behaviorData.Height = newValue;
  }
  _getOutline() {
    return this._behaviorData.Outline !== undefined ? this._behaviorData.Outline : Number("") || 0;
  }
  _setOutline(newValue) {
    this._behaviorData.Outline = newValue;
  }
  _getColor() {
    return this._behaviorData.Color !== undefined ? this._behaviorData.Color : "";
  }
  _setColor(newValue) {
    this._behaviorData.Color = newValue;
  }
  _getRotation() {
    return this._behaviorData.Rotation !== undefined ? this._behaviorData.Rotation : Number("") || 0;
  }
  _setRotation(newValue) {
    this._behaviorData.Rotation = newValue;
  }
  _getCurrentWidth() {
    return this._behaviorData.CurrentWidth !== undefined ? this._behaviorData.CurrentWidth : Number("") || 0;
  }
  _setCurrentWidth(newValue) {
    this._behaviorData.CurrentWidth = newValue;
  }
  _getCurrentHeight() {
    return this._behaviorData.CurrentHeight !== undefined ? this._behaviorData.CurrentHeight : Number("") || 0;
  }
  _setCurrentHeight(newValue) {
    this._behaviorData.CurrentHeight = newValue;
  }
  _getCurrentOutline() {
    return this._behaviorData.CurrentOutline !== undefined ? this._behaviorData.CurrentOutline : Number("") || 0;
  }
  _setCurrentOutline(newValue) {
    this._behaviorData.CurrentOutline = newValue;
  }
  _getCurrentOpacity() {
    return this._behaviorData.CurrentOpacity !== undefined ? this._behaviorData.CurrentOpacity : Number("") || 0;
  }
  _setCurrentOpacity(newValue) {
    this._behaviorData.CurrentOpacity = newValue;
  }
  _getCurrentAngle() {
    return this._behaviorData.CurrentAngle !== undefined ? this._behaviorData.CurrentAngle : Number("") || 0;
  }
  _setCurrentAngle(newValue) {
    this._behaviorData.CurrentAngle = newValue;
  }
  _getProgress() {
    return this._behaviorData.Progress !== undefined ? this._behaviorData.Progress : Number("0") || 0;
  }
  _setProgress(newValue) {
    this._behaviorData.Progress = newValue;
  }
  _getEasedProgress() {
    return this._behaviorData.EasedProgress !== undefined ? this._behaviorData.EasedProgress : Number("0") || 0;
  }
  _setEasedProgress(newValue) {
    this._behaviorData.EasedProgress = newValue;
  }
}

/**
 * Shared data generated from Ellipse shock wave
 */
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.SharedData = class EllipseShockWaveSharedData {
  constructor(sharedData) {
    
  }
  
  // Shared properties:
  
}

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.getSharedData = function(instanceContainer, behaviorName) {
  if (!instanceContainer._ShockWaveEffect_EllipseShockWaveSharedData) {
    const initialData = instanceContainer.getInitialSharedDataForBehavior(
      behaviorName
    );
    instanceContainer._ShockWaveEffect_EllipseShockWaveSharedData = new gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.SharedData(
      initialData
    );
  }
  return instanceContainer._ShockWaveEffect_EllipseShockWaveSharedData;
}

// Methods:
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.GDObjectObjects1[i].setClearBetweenFrames(false);
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreated = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.onCreatedContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects3= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setProgress(gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getProgress() + (gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene) * gdjs.evtTools.camera.getLayerTimeScale(runtimeScene, (gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getLayer())) / eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getDuration()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEasedProgress(gdjs.evtTools.tween.ease(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasing(), 0, 1, eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentWidth(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartWidth(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndWidth(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentHeight(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartHeight(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndHeight(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentAngle(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartAngle(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndAngle(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentOutline(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartOutlineThickness(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndOutlineThickness(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentOpacity(gdjs.evtTools.common.clamp(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartOpacity(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndOpacity(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()), 0, 255));
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getProgress() > 1 ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[k] = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1 */
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i].deleteFromScene(runtimeScene);
}
}
}

}


};gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.eventsList1 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length;i<l;++i) {
    if ( !(gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getIsFilled()) ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[k] = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2 */
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setOutlineColor(gdjs.evtsExt__ShockWaveEffect__RgbMean.func(runtimeScene, eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartColor(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndColor(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress(), eventsFunctionContext));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setFillOpacity(0);
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setOutlineSize(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentOutline());
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setOutlineOpacity(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentOpacity());
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length;i<l;++i) {
    if ( gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getIsFilled() ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[k] = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2 */
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setFillColor(gdjs.evtsExt__ShockWaveEffect__RgbMean.func(runtimeScene, eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartColor(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndColor(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress(), eventsFunctionContext));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setFillOpacity(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentOpacity());
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setOutlineSize(0);
}
}
}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i].clear();
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i].drawEllipse(0, 0, eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentWidth(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentHeight());
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i].setAngle(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentAngle());
}
}
}

}


};gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.eventsList2 = function(runtimeScene, eventsFunctionContext) {

{


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.eventsList0(runtimeScene, eventsFunctionContext);
}


{


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.eventsList1(runtimeScene, eventsFunctionContext);
}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEvents = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects3.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.eventsList2(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPostEventsContext.GDObjectObjects3.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartWidth();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidth = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartWidthContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartWidth(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidth = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartWidthContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartHeight();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeight = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartHeightContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartHeight(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeight = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartHeightContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartOutlineThickness();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThickness = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartOutlineThickness(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThickness = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartColor();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColor = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartColorContext.GDObjectObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartColor(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColor = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartColorContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartOpacity();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacity = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartOpacityContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartOpacity(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacity = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartOpacityContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartAngle();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngle = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.StartAngleContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartAngle(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngle = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetStartAngleContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndWidth();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidth = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndWidthContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndWidth(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidth = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndWidthContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndHeight();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeight = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndHeightContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndHeight(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeight = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndHeightContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndOutlineThickness();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThickness = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndOutlineThickness(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThickness = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndColor();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColor = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndColorContext.GDObjectObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndColor(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColor = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndColorContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndOpacity();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacity = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndOpacityContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndOpacity(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacity = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndOpacityContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndAngle();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngle = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EndAngleContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndAngle(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngle = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEndAngleContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getDuration();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.Duration = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.DurationContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setDuration(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDuration = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetDurationContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasing();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.Easing = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.EasingContext.GDObjectObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEasing(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasing = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetEasingContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getIsFilled() ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects1[k] = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
{eventsFunctionContext.returnValue = true;}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilled = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.IsFilledContext.GDObjectObjects2.length = 0;


return !!eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext = {};
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setIsFilled(false);
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !!eventsFunctionContext.getArgument("Value");
}
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setIsFilled(true);
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilled = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
let scopeInstanceContainer = null;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ShockWaveEffect"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ShockWaveEffect"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.SetIsFilledContext.GDObjectObjects2.length = 0;


return;
}

gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave.prototype.doStepPreEvents = function() {
  this._onceTriggers.startNewFrame();
};


gdjs.registerBehavior("ShockWaveEffect::EllipseShockWave", gdjs.evtsExt__ShockWaveEffect__EllipseShockWave.EllipseShockWave);
