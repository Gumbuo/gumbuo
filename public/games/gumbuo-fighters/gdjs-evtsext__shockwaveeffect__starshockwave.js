
gdjs.evtsExt__ShockWaveEffect__StarShockWave = gdjs.evtsExt__ShockWaveEffect__StarShockWave || {};

/**
 * Behavior generated from Star shock waves
 */
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave = class StarShockWave extends gdjs.RuntimeBehavior {
  constructor(instanceContainer, behaviorData, owner) {
    super(instanceContainer, behaviorData, owner);
    this._runtimeScene = instanceContainer;

    this._onceTriggers = new gdjs.OnceTriggers();
    this._behaviorData = {};
    this._sharedData = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.getSharedData(
      instanceContainer,
      behaviorData.name
    );
    
    this._behaviorData.StartRadius = behaviorData.StartRadius !== undefined ? behaviorData.StartRadius : Number("4") || 0;
    this._behaviorData.StartInnerRadius = behaviorData.StartInnerRadius !== undefined ? behaviorData.StartInnerRadius : Number("8") || 0;
    this._behaviorData.StartOutlineThickness = behaviorData.StartOutlineThickness !== undefined ? behaviorData.StartOutlineThickness : Number("16") || 0;
    this._behaviorData.StartColor = behaviorData.StartColor !== undefined ? behaviorData.StartColor : "255;217;154";
    this._behaviorData.StartOpacity = behaviorData.StartOpacity !== undefined ? behaviorData.StartOpacity : Number("255") || 0;
    this._behaviorData.StartAngle = behaviorData.StartAngle !== undefined ? behaviorData.StartAngle : Number("0") || 0;
    this._behaviorData.EndRadius = behaviorData.EndRadius !== undefined ? behaviorData.EndRadius : Number("64") || 0;
    this._behaviorData.EndInnerRadius = behaviorData.EndInnerRadius !== undefined ? behaviorData.EndInnerRadius : Number("128") || 0;
    this._behaviorData.EndOutlineThickness = behaviorData.EndOutlineThickness !== undefined ? behaviorData.EndOutlineThickness : Number("0") || 0;
    this._behaviorData.EndColor = behaviorData.EndColor !== undefined ? behaviorData.EndColor : "255;217;154";
    this._behaviorData.EndOpacity = behaviorData.EndOpacity !== undefined ? behaviorData.EndOpacity : Number("0") || 0;
    this._behaviorData.EndAngle = behaviorData.EndAngle !== undefined ? behaviorData.EndAngle : Number("72") || 0;
    this._behaviorData.Easing = behaviorData.Easing !== undefined ? behaviorData.Easing : "easeOutSine";
    this._behaviorData.Duration = behaviorData.Duration !== undefined ? behaviorData.Duration : Number("1") || 0;
    this._behaviorData.PointsCount = behaviorData.PointsCount !== undefined ? behaviorData.PointsCount : Number("5") || 0;
    this._behaviorData.IsFilling = behaviorData.IsFilling !== undefined ? behaviorData.IsFilling : false;
    this._behaviorData.Radius = Number("") || 0;
    this._behaviorData.InnerRadius = Number("") || 0;
    this._behaviorData.Outline = Number("") || 0;
    this._behaviorData.Color = "";
    this._behaviorData.Rotation = Number("") || 0;
    this._behaviorData.CurrentRadius = Number("") || 0;
    this._behaviorData.CurrentInnerRadius = Number("") || 0;
    this._behaviorData.CurrentOpacity = Number("") || 0;
    this._behaviorData.CurrentOutline = Number("") || 0;
    this._behaviorData.CurrentAngle = Number("") || 0;
    this._behaviorData.Progress = Number("") || 0;
    this._behaviorData.EasedProgress = Number("") || 0;
  }

  // Hot-reload:
  updateFromBehaviorData(oldBehaviorData, newBehaviorData) {
    
    if (oldBehaviorData.StartRadius !== newBehaviorData.StartRadius)
      this._behaviorData.StartRadius = newBehaviorData.StartRadius;
    if (oldBehaviorData.StartInnerRadius !== newBehaviorData.StartInnerRadius)
      this._behaviorData.StartInnerRadius = newBehaviorData.StartInnerRadius;
    if (oldBehaviorData.StartOutlineThickness !== newBehaviorData.StartOutlineThickness)
      this._behaviorData.StartOutlineThickness = newBehaviorData.StartOutlineThickness;
    if (oldBehaviorData.StartColor !== newBehaviorData.StartColor)
      this._behaviorData.StartColor = newBehaviorData.StartColor;
    if (oldBehaviorData.StartOpacity !== newBehaviorData.StartOpacity)
      this._behaviorData.StartOpacity = newBehaviorData.StartOpacity;
    if (oldBehaviorData.StartAngle !== newBehaviorData.StartAngle)
      this._behaviorData.StartAngle = newBehaviorData.StartAngle;
    if (oldBehaviorData.EndRadius !== newBehaviorData.EndRadius)
      this._behaviorData.EndRadius = newBehaviorData.EndRadius;
    if (oldBehaviorData.EndInnerRadius !== newBehaviorData.EndInnerRadius)
      this._behaviorData.EndInnerRadius = newBehaviorData.EndInnerRadius;
    if (oldBehaviorData.EndOutlineThickness !== newBehaviorData.EndOutlineThickness)
      this._behaviorData.EndOutlineThickness = newBehaviorData.EndOutlineThickness;
    if (oldBehaviorData.EndColor !== newBehaviorData.EndColor)
      this._behaviorData.EndColor = newBehaviorData.EndColor;
    if (oldBehaviorData.EndOpacity !== newBehaviorData.EndOpacity)
      this._behaviorData.EndOpacity = newBehaviorData.EndOpacity;
    if (oldBehaviorData.EndAngle !== newBehaviorData.EndAngle)
      this._behaviorData.EndAngle = newBehaviorData.EndAngle;
    if (oldBehaviorData.Easing !== newBehaviorData.Easing)
      this._behaviorData.Easing = newBehaviorData.Easing;
    if (oldBehaviorData.Duration !== newBehaviorData.Duration)
      this._behaviorData.Duration = newBehaviorData.Duration;
    if (oldBehaviorData.PointsCount !== newBehaviorData.PointsCount)
      this._behaviorData.PointsCount = newBehaviorData.PointsCount;
    if (oldBehaviorData.IsFilling !== newBehaviorData.IsFilling)
      this._behaviorData.IsFilling = newBehaviorData.IsFilling;
    if (oldBehaviorData.Radius !== newBehaviorData.Radius)
      this._behaviorData.Radius = newBehaviorData.Radius;
    if (oldBehaviorData.InnerRadius !== newBehaviorData.InnerRadius)
      this._behaviorData.InnerRadius = newBehaviorData.InnerRadius;
    if (oldBehaviorData.Outline !== newBehaviorData.Outline)
      this._behaviorData.Outline = newBehaviorData.Outline;
    if (oldBehaviorData.Color !== newBehaviorData.Color)
      this._behaviorData.Color = newBehaviorData.Color;
    if (oldBehaviorData.Rotation !== newBehaviorData.Rotation)
      this._behaviorData.Rotation = newBehaviorData.Rotation;
    if (oldBehaviorData.CurrentRadius !== newBehaviorData.CurrentRadius)
      this._behaviorData.CurrentRadius = newBehaviorData.CurrentRadius;
    if (oldBehaviorData.CurrentInnerRadius !== newBehaviorData.CurrentInnerRadius)
      this._behaviorData.CurrentInnerRadius = newBehaviorData.CurrentInnerRadius;
    if (oldBehaviorData.CurrentOpacity !== newBehaviorData.CurrentOpacity)
      this._behaviorData.CurrentOpacity = newBehaviorData.CurrentOpacity;
    if (oldBehaviorData.CurrentOutline !== newBehaviorData.CurrentOutline)
      this._behaviorData.CurrentOutline = newBehaviorData.CurrentOutline;
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
        
    StartRadius: this._behaviorData.StartRadius,
    StartInnerRadius: this._behaviorData.StartInnerRadius,
    StartOutlineThickness: this._behaviorData.StartOutlineThickness,
    StartColor: this._behaviorData.StartColor,
    StartOpacity: this._behaviorData.StartOpacity,
    StartAngle: this._behaviorData.StartAngle,
    EndRadius: this._behaviorData.EndRadius,
    EndInnerRadius: this._behaviorData.EndInnerRadius,
    EndOutlineThickness: this._behaviorData.EndOutlineThickness,
    EndColor: this._behaviorData.EndColor,
    EndOpacity: this._behaviorData.EndOpacity,
    EndAngle: this._behaviorData.EndAngle,
    Easing: this._behaviorData.Easing,
    Duration: this._behaviorData.Duration,
    PointsCount: this._behaviorData.PointsCount,
    IsFilling: this._behaviorData.IsFilling,
    Radius: this._behaviorData.Radius,
    InnerRadius: this._behaviorData.InnerRadius,
    Outline: this._behaviorData.Outline,
    Color: this._behaviorData.Color,
    Rotation: this._behaviorData.Rotation,
    CurrentRadius: this._behaviorData.CurrentRadius,
    CurrentInnerRadius: this._behaviorData.CurrentInnerRadius,
    CurrentOpacity: this._behaviorData.CurrentOpacity,
    CurrentOutline: this._behaviorData.CurrentOutline,
    CurrentAngle: this._behaviorData.CurrentAngle,
    Progress: this._behaviorData.Progress,
    EasedProgress: this._behaviorData.EasedProgress,
      }
    };
  }
  updateFromNetworkSyncData(networkSyncData, options) {
    super.updateFromNetworkSyncData(networkSyncData, options);
    
    if (networkSyncData.props.StartRadius !== undefined)
      this._behaviorData.StartRadius = networkSyncData.props.StartRadius;
    if (networkSyncData.props.StartInnerRadius !== undefined)
      this._behaviorData.StartInnerRadius = networkSyncData.props.StartInnerRadius;
    if (networkSyncData.props.StartOutlineThickness !== undefined)
      this._behaviorData.StartOutlineThickness = networkSyncData.props.StartOutlineThickness;
    if (networkSyncData.props.StartColor !== undefined)
      this._behaviorData.StartColor = networkSyncData.props.StartColor;
    if (networkSyncData.props.StartOpacity !== undefined)
      this._behaviorData.StartOpacity = networkSyncData.props.StartOpacity;
    if (networkSyncData.props.StartAngle !== undefined)
      this._behaviorData.StartAngle = networkSyncData.props.StartAngle;
    if (networkSyncData.props.EndRadius !== undefined)
      this._behaviorData.EndRadius = networkSyncData.props.EndRadius;
    if (networkSyncData.props.EndInnerRadius !== undefined)
      this._behaviorData.EndInnerRadius = networkSyncData.props.EndInnerRadius;
    if (networkSyncData.props.EndOutlineThickness !== undefined)
      this._behaviorData.EndOutlineThickness = networkSyncData.props.EndOutlineThickness;
    if (networkSyncData.props.EndColor !== undefined)
      this._behaviorData.EndColor = networkSyncData.props.EndColor;
    if (networkSyncData.props.EndOpacity !== undefined)
      this._behaviorData.EndOpacity = networkSyncData.props.EndOpacity;
    if (networkSyncData.props.EndAngle !== undefined)
      this._behaviorData.EndAngle = networkSyncData.props.EndAngle;
    if (networkSyncData.props.Easing !== undefined)
      this._behaviorData.Easing = networkSyncData.props.Easing;
    if (networkSyncData.props.Duration !== undefined)
      this._behaviorData.Duration = networkSyncData.props.Duration;
    if (networkSyncData.props.PointsCount !== undefined)
      this._behaviorData.PointsCount = networkSyncData.props.PointsCount;
    if (networkSyncData.props.IsFilling !== undefined)
      this._behaviorData.IsFilling = networkSyncData.props.IsFilling;
    if (networkSyncData.props.Radius !== undefined)
      this._behaviorData.Radius = networkSyncData.props.Radius;
    if (networkSyncData.props.InnerRadius !== undefined)
      this._behaviorData.InnerRadius = networkSyncData.props.InnerRadius;
    if (networkSyncData.props.Outline !== undefined)
      this._behaviorData.Outline = networkSyncData.props.Outline;
    if (networkSyncData.props.Color !== undefined)
      this._behaviorData.Color = networkSyncData.props.Color;
    if (networkSyncData.props.Rotation !== undefined)
      this._behaviorData.Rotation = networkSyncData.props.Rotation;
    if (networkSyncData.props.CurrentRadius !== undefined)
      this._behaviorData.CurrentRadius = networkSyncData.props.CurrentRadius;
    if (networkSyncData.props.CurrentInnerRadius !== undefined)
      this._behaviorData.CurrentInnerRadius = networkSyncData.props.CurrentInnerRadius;
    if (networkSyncData.props.CurrentOpacity !== undefined)
      this._behaviorData.CurrentOpacity = networkSyncData.props.CurrentOpacity;
    if (networkSyncData.props.CurrentOutline !== undefined)
      this._behaviorData.CurrentOutline = networkSyncData.props.CurrentOutline;
    if (networkSyncData.props.CurrentAngle !== undefined)
      this._behaviorData.CurrentAngle = networkSyncData.props.CurrentAngle;
    if (networkSyncData.props.Progress !== undefined)
      this._behaviorData.Progress = networkSyncData.props.Progress;
    if (networkSyncData.props.EasedProgress !== undefined)
      this._behaviorData.EasedProgress = networkSyncData.props.EasedProgress;
  }

  // Properties:
  
  _getStartRadius() {
    return this._behaviorData.StartRadius !== undefined ? this._behaviorData.StartRadius : Number("4") || 0;
  }
  _setStartRadius(newValue) {
    this._behaviorData.StartRadius = newValue;
  }
  _getStartInnerRadius() {
    return this._behaviorData.StartInnerRadius !== undefined ? this._behaviorData.StartInnerRadius : Number("8") || 0;
  }
  _setStartInnerRadius(newValue) {
    this._behaviorData.StartInnerRadius = newValue;
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
  _getEndRadius() {
    return this._behaviorData.EndRadius !== undefined ? this._behaviorData.EndRadius : Number("64") || 0;
  }
  _setEndRadius(newValue) {
    this._behaviorData.EndRadius = newValue;
  }
  _getEndInnerRadius() {
    return this._behaviorData.EndInnerRadius !== undefined ? this._behaviorData.EndInnerRadius : Number("128") || 0;
  }
  _setEndInnerRadius(newValue) {
    this._behaviorData.EndInnerRadius = newValue;
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
    return this._behaviorData.EndAngle !== undefined ? this._behaviorData.EndAngle : Number("72") || 0;
  }
  _setEndAngle(newValue) {
    this._behaviorData.EndAngle = newValue;
  }
  _getEasing() {
    return this._behaviorData.Easing !== undefined ? this._behaviorData.Easing : "easeOutSine";
  }
  _setEasing(newValue) {
    this._behaviorData.Easing = newValue;
  }
  _getDuration() {
    return this._behaviorData.Duration !== undefined ? this._behaviorData.Duration : Number("1") || 0;
  }
  _setDuration(newValue) {
    this._behaviorData.Duration = newValue;
  }
  _getPointsCount() {
    return this._behaviorData.PointsCount !== undefined ? this._behaviorData.PointsCount : Number("5") || 0;
  }
  _setPointsCount(newValue) {
    this._behaviorData.PointsCount = newValue;
  }
  _getIsFilling() {
    return this._behaviorData.IsFilling !== undefined ? this._behaviorData.IsFilling : false;
  }
  _setIsFilling(newValue) {
    this._behaviorData.IsFilling = newValue;
  }
  _toggleIsFilling() {
    this._setIsFilling(!this._getIsFilling());
  }
  _getRadius() {
    return this._behaviorData.Radius !== undefined ? this._behaviorData.Radius : Number("") || 0;
  }
  _setRadius(newValue) {
    this._behaviorData.Radius = newValue;
  }
  _getInnerRadius() {
    return this._behaviorData.InnerRadius !== undefined ? this._behaviorData.InnerRadius : Number("") || 0;
  }
  _setInnerRadius(newValue) {
    this._behaviorData.InnerRadius = newValue;
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
  _getCurrentRadius() {
    return this._behaviorData.CurrentRadius !== undefined ? this._behaviorData.CurrentRadius : Number("") || 0;
  }
  _setCurrentRadius(newValue) {
    this._behaviorData.CurrentRadius = newValue;
  }
  _getCurrentInnerRadius() {
    return this._behaviorData.CurrentInnerRadius !== undefined ? this._behaviorData.CurrentInnerRadius : Number("") || 0;
  }
  _setCurrentInnerRadius(newValue) {
    this._behaviorData.CurrentInnerRadius = newValue;
  }
  _getCurrentOpacity() {
    return this._behaviorData.CurrentOpacity !== undefined ? this._behaviorData.CurrentOpacity : Number("") || 0;
  }
  _setCurrentOpacity(newValue) {
    this._behaviorData.CurrentOpacity = newValue;
  }
  _getCurrentOutline() {
    return this._behaviorData.CurrentOutline !== undefined ? this._behaviorData.CurrentOutline : Number("") || 0;
  }
  _setCurrentOutline(newValue) {
    this._behaviorData.CurrentOutline = newValue;
  }
  _getCurrentAngle() {
    return this._behaviorData.CurrentAngle !== undefined ? this._behaviorData.CurrentAngle : Number("") || 0;
  }
  _setCurrentAngle(newValue) {
    this._behaviorData.CurrentAngle = newValue;
  }
  _getProgress() {
    return this._behaviorData.Progress !== undefined ? this._behaviorData.Progress : Number("") || 0;
  }
  _setProgress(newValue) {
    this._behaviorData.Progress = newValue;
  }
  _getEasedProgress() {
    return this._behaviorData.EasedProgress !== undefined ? this._behaviorData.EasedProgress : Number("") || 0;
  }
  _setEasedProgress(newValue) {
    this._behaviorData.EasedProgress = newValue;
  }
}

/**
 * Shared data generated from Star shock waves
 */
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.SharedData = class StarShockWaveSharedData {
  constructor(sharedData) {
    
  }
  
  // Shared properties:
  
}

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.getSharedData = function(instanceContainer, behaviorName) {
  if (!instanceContainer._ShockWaveEffect_StarShockWaveSharedData) {
    const initialData = instanceContainer.getInitialSharedDataForBehavior(
      behaviorName
    );
    instanceContainer._ShockWaveEffect_StarShockWaveSharedData = new gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.SharedData(
      initialData
    );
  }
  return instanceContainer._ShockWaveEffect_StarShockWaveSharedData;
}

// Methods:
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.GDObjectObjects1[i].setClearBetweenFrames(false);
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreated = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.onCreatedContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects3= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setProgress(gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getProgress() + (gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene) * gdjs.evtTools.camera.getLayerTimeScale(runtimeScene, (gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getLayer())) / eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getDuration()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEasedProgress(gdjs.evtTools.tween.ease(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasing(), 0, 1, eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentRadius(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartRadius(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndRadius(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentInnerRadius(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartInnerRadius(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndInnerRadius(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentAngle(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartAngle(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndAngle(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentOutline(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartOutlineThickness(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndOutlineThickness(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentOpacity(gdjs.evtTools.common.clamp(gdjs.evtTools.common.lerp(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartOpacity(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndOpacity(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress()), 0, 255));
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getProgress() > 1 ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[k] = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1 */
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i].deleteFromScene(runtimeScene);
}
}
}

}


};gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.eventsList1 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length;i<l;++i) {
    if ( !(gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getIsFilling()) ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[k] = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2 */
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setOutlineColor(gdjs.evtsExt__ShockWaveEffect__RgbMean.func(runtimeScene, eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartColor(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndColor(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress(), eventsFunctionContext));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setFillOpacity(0);
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setOutlineSize(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentOutline());
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setOutlineOpacity(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentOpacity());
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length;i<l;++i) {
    if ( gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getIsFilling() ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[k] = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2 */
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setFillColor(gdjs.evtsExt__ShockWaveEffect__RgbMean.func(runtimeScene, eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartColor(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndColor(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasedProgress(), eventsFunctionContext));
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setFillOpacity(eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentOpacity());
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2[i].setOutlineSize(0);
}
}
}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i].clear();
}
}
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1[i].drawStar(0, 0, eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getPointsCount(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentRadius(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentInnerRadius(), eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentAngle());
}
}
}

}


};gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.eventsList2 = function(runtimeScene, eventsFunctionContext) {

{


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.eventsList0(runtimeScene, eventsFunctionContext);
}


{


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.eventsList1(runtimeScene, eventsFunctionContext);
}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEvents = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects3.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.eventsList2(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPostEventsContext.GDObjectObjects3.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartRadius();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadius = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartRadiusContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartRadius(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadius = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartRadiusContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartInnerRadius();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadius = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartInnerRadiusContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartInnerRadius(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadius = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartInnerRadiusContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartOutlineThickness();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThickness = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOutlineThicknessContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartOutlineThickness(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThickness = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOutlineThicknessContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartColor();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColor = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartColorContext.GDObjectObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartColor(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColor = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartColorContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartOpacity();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacity = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartOpacityContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartOpacity(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacity = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartOpacityContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getStartAngle();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngle = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.StartAngleContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setStartAngle(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngle = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetStartAngleContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndRadius();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadius = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndRadiusContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndRadius(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadius = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndRadiusContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndInnerRadius();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadius = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndInnerRadiusContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndInnerRadius(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadius = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndInnerRadiusContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndOutlineThickness();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThickness = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOutlineThicknessContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndOutlineThickness(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThickness = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOutlineThicknessContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndColor();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColor = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndColorContext.GDObjectObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndColor(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColor = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndColorContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndOpacity();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacity = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndOpacityContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndOpacity(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacity = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndOpacityContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEndAngle();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngle = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EndAngleContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEndAngle(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngle = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEndAngleContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getEasing();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.Easing = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.EasingContext.GDObjectObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setEasing(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasing = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetEasingContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getDuration();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.Duration = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.DurationContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setDuration(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDuration = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetDurationContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getIsFilling() ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects1[k] = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
{eventsFunctionContext.returnValue = true;}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFilling = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.IsFillingContext.GDObjectObjects2.length = 0;


return !!eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setIsFilling(false);
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
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setIsFilling(true);
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFilling = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetIsFillingContext.GDObjectObjects2.length = 0;


return;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getPointsCount();}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCount = function(parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.PointsCountContext.GDObjectObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext = {};
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.idToCallbackMap = new Map();
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.GDObjectObjects1= [];
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.GDObjectObjects2= [];


gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setPointsCount(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCount = function(Value, parentEventsFunctionContext) {

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

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.SetPointsCountContext.GDObjectObjects2.length = 0;


return;
}

gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave.prototype.doStepPreEvents = function() {
  this._onceTriggers.startNewFrame();
};


gdjs.registerBehavior("ShockWaveEffect::StarShockWave", gdjs.evtsExt__ShockWaveEffect__StarShockWave.StarShockWave);
