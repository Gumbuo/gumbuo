gdjs.MainMenuCode = {};
gdjs.MainMenuCode.localVariables = [];
gdjs.MainMenuCode.idToCallbackMap = new Map();
gdjs.MainMenuCode.GDBackgroundObjects1= [];
gdjs.MainMenuCode.GDBackgroundObjects2= [];
gdjs.MainMenuCode.GDBackgroundObjects3= [];
gdjs.MainMenuCode.GDBackgroundObjects4= [];
gdjs.MainMenuCode.GDMoonLightObjects1= [];
gdjs.MainMenuCode.GDMoonLightObjects2= [];
gdjs.MainMenuCode.GDMoonLightObjects3= [];
gdjs.MainMenuCode.GDMoonLightObjects4= [];
gdjs.MainMenuCode.GD_95951PlayerButtonObjects1= [];
gdjs.MainMenuCode.GD_95951PlayerButtonObjects2= [];
gdjs.MainMenuCode.GD_95951PlayerButtonObjects3= [];
gdjs.MainMenuCode.GD_95951PlayerButtonObjects4= [];
gdjs.MainMenuCode.GD_95952PlayersButtonObjects1= [];
gdjs.MainMenuCode.GD_95952PlayersButtonObjects2= [];
gdjs.MainMenuCode.GD_95952PlayersButtonObjects3= [];
gdjs.MainMenuCode.GD_95952PlayersButtonObjects4= [];
gdjs.MainMenuCode.GDButtonsLightsObjects1= [];
gdjs.MainMenuCode.GDButtonsLightsObjects2= [];
gdjs.MainMenuCode.GDButtonsLightsObjects3= [];
gdjs.MainMenuCode.GDButtonsLightsObjects4= [];
gdjs.MainMenuCode.GDTransitionInObjects1= [];
gdjs.MainMenuCode.GDTransitionInObjects2= [];
gdjs.MainMenuCode.GDTransitionInObjects3= [];
gdjs.MainMenuCode.GDTransitionInObjects4= [];
gdjs.MainMenuCode.GDTransitionToGameObjects1= [];
gdjs.MainMenuCode.GDTransitionToGameObjects2= [];
gdjs.MainMenuCode.GDTransitionToGameObjects3= [];
gdjs.MainMenuCode.GDTransitionToGameObjects4= [];
gdjs.MainMenuCode.GDBackButtonObjects1= [];
gdjs.MainMenuCode.GDBackButtonObjects2= [];
gdjs.MainMenuCode.GDBackButtonObjects3= [];
gdjs.MainMenuCode.GDBackButtonObjects4= [];
gdjs.MainMenuCode.GDControlsButtonObjects1= [];
gdjs.MainMenuCode.GDControlsButtonObjects2= [];
gdjs.MainMenuCode.GDControlsButtonObjects3= [];
gdjs.MainMenuCode.GDControlsButtonObjects4= [];
gdjs.MainMenuCode.GDTransitionToControlsInObjects1= [];
gdjs.MainMenuCode.GDTransitionToControlsInObjects2= [];
gdjs.MainMenuCode.GDTransitionToControlsInObjects3= [];
gdjs.MainMenuCode.GDTransitionToControlsInObjects4= [];
gdjs.MainMenuCode.GDTransitionToControlsOutObjects1= [];
gdjs.MainMenuCode.GDTransitionToControlsOutObjects2= [];
gdjs.MainMenuCode.GDTransitionToControlsOutObjects3= [];
gdjs.MainMenuCode.GDTransitionToControlsOutObjects4= [];
gdjs.MainMenuCode.GDControlsMenuObjects1= [];
gdjs.MainMenuCode.GDControlsMenuObjects2= [];
gdjs.MainMenuCode.GDControlsMenuObjects3= [];
gdjs.MainMenuCode.GDControlsMenuObjects4= [];
gdjs.MainMenuCode.GDTransitionToMainMenuObjects1= [];
gdjs.MainMenuCode.GDTransitionToMainMenuObjects2= [];
gdjs.MainMenuCode.GDTransitionToMainMenuObjects3= [];
gdjs.MainMenuCode.GDTransitionToMainMenuObjects4= [];
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects1= [];
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects2= [];
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects3= [];
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects4= [];


gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionInObjects1Objects = Hashtable.newFrom({"TransitionIn": gdjs.MainMenuCode.GDTransitionInObjects1});
gdjs.MainMenuCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.systemInfo.isPreview(runtimeScene);
if (isConditionTrue_0) {
{gdjs.evtTools.window.setFullScreen(runtimeScene, false, true);
}
}

}


};gdjs.MainMenuCode.eventsList1 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("Background"), gdjs.MainMenuCode.GDBackgroundObjects1);
{for(var i = 0, len = gdjs.MainMenuCode.GDBackgroundObjects1.length ;i < len;++i) {
    gdjs.MainMenuCode.GDBackgroundObjects1[i].setXOffset(gdjs.MainMenuCode.GDBackgroundObjects1[i].getXOffset() + (0.4));
}
}
}

}


};gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595951PlayerButtonObjects3Objects = Hashtable.newFrom({"_1PlayerButton": gdjs.MainMenuCode.GD_95951PlayerButtonObjects3});
gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects = Hashtable.newFrom({"TransitionIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects = Hashtable.newFrom({"TransitionToGame": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects = Hashtable.newFrom({"TransitionToControlsIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects = Hashtable.newFrom({"TransitionToControlsOut": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects = Hashtable.newFrom({"TransitionToMainMenu": []});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595951PlayerButtonObjects3Objects = Hashtable.newFrom({"_1PlayerButton": gdjs.MainMenuCode.GD_95951PlayerButtonObjects3});
gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects = Hashtable.newFrom({"TransitionIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects = Hashtable.newFrom({"TransitionToGame": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects = Hashtable.newFrom({"TransitionToControlsIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects = Hashtable.newFrom({"TransitionToControlsOut": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects = Hashtable.newFrom({"TransitionToMainMenu": []});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595951PlayerButtonObjects3Objects = Hashtable.newFrom({"_1PlayerButton": gdjs.MainMenuCode.GD_95951PlayerButtonObjects3});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToGameObjects3Objects = Hashtable.newFrom({"TransitionToGame": gdjs.MainMenuCode.GDTransitionToGameObjects3});
gdjs.MainMenuCode.eventsList2 = function(runtimeScene) {

{



}


{

gdjs.copyArray(runtimeScene.getObjects("_1PlayerButton"), gdjs.MainMenuCode.GD_95951PlayerButtonObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595951PlayerButtonObjects3Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length;i<l;++i) {
    if ( !(gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i].getBehavior("Effect").isEffectEnabled("Outline")) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[k] = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[k] = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length = k;
}
}
}
}
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GD_95951PlayerButtonObjects3 */
{gdjs.evtTools.sound.playSound(runtimeScene, "HoverButtonSoundEffect", false, 30, 1);
}
{for(var i = 0, len = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i].getBehavior("Effect").enableEffect("Outline", true);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("_1PlayerButton"), gdjs.MainMenuCode.GD_95951PlayerButtonObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595951PlayerButtonObjects3Objects, runtimeScene, true, true);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i].getBehavior("Effect").isEffectEnabled("Outline") ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[k] = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length = k;
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GD_95951PlayerButtonObjects3 */
{for(var i = 0, len = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i].getBehavior("Effect").enableEffect("Outline", false);
}
}
}

}


{



}


{

gdjs.copyArray(runtimeScene.getObjects("_1PlayerButton"), gdjs.MainMenuCode.GD_95951PlayerButtonObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18886212);
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[k] = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595951PlayerButtonObjects3Objects, runtimeScene, true, false);
}
}
}
}
}
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GD_95951PlayerButtonObjects3 */
gdjs.MainMenuCode.GDTransitionToGameObjects3.length = 0;

{gdjs.evtTools.sound.playSound(runtimeScene, "HoverButtonSoundEffect", false, 40, 1.5);
}
{for(var i = 0, len = gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95951PlayerButtonObjects3[i].getBehavior("Animation").setAnimationName("Pressed");
}
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToGameObjects3Objects, 0, 0, "");
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToGameObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToGameObjects3[i].getBehavior("FlashTransitionPainter").PaintEffect("0;0;0", 0.5, "Flash", "Forward", 255, null);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToGameObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToGameObjects3[i].setZOrder(100);
}
}
{gdjs.evtTools.sound.fadeSoundVolume(runtimeScene, 0, 0, 0.3);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("TransitionToGame"), gdjs.MainMenuCode.GDTransitionToGameObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDTransitionToGameObjects2.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDTransitionToGameObjects2[i].getBehavior("FlashTransitionPainter").PaintEffectIsEnd(null) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDTransitionToGameObjects2[k] = gdjs.MainMenuCode.GDTransitionToGameObjects2[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDTransitionToGameObjects2.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18957268);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Game", false);
}
}

}


};gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595952PlayersButtonObjects3Objects = Hashtable.newFrom({"_2PlayersButton": gdjs.MainMenuCode.GD_95952PlayersButtonObjects3});
gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects = Hashtable.newFrom({"TransitionIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects = Hashtable.newFrom({"TransitionToGame": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects = Hashtable.newFrom({"TransitionToControlsIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects = Hashtable.newFrom({"TransitionToControlsOut": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects = Hashtable.newFrom({"TransitionToMainMenu": []});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595952PlayersButtonObjects3Objects = Hashtable.newFrom({"_2PlayersButton": gdjs.MainMenuCode.GD_95952PlayersButtonObjects3});
gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects = Hashtable.newFrom({"TransitionIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects = Hashtable.newFrom({"TransitionToGame": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects = Hashtable.newFrom({"TransitionToControlsIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects = Hashtable.newFrom({"TransitionToControlsOut": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects = Hashtable.newFrom({"TransitionToMainMenu": []});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595952PlayersButtonObjects3Objects = Hashtable.newFrom({"_2PlayersButton": gdjs.MainMenuCode.GD_95952PlayersButtonObjects3});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToGameObjects3Objects = Hashtable.newFrom({"TransitionToGame": gdjs.MainMenuCode.GDTransitionToGameObjects3});
gdjs.MainMenuCode.eventsList3 = function(runtimeScene) {

{



}


{

gdjs.copyArray(runtimeScene.getObjects("_2PlayersButton"), gdjs.MainMenuCode.GD_95952PlayersButtonObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595952PlayersButtonObjects3Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length;i<l;++i) {
    if ( !(gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i].getBehavior("Effect").isEffectEnabled("Outline")) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[k] = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[k] = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length = k;
}
}
}
}
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GD_95952PlayersButtonObjects3 */
{gdjs.evtTools.sound.playSound(runtimeScene, "HoverButtonSoundEffect", false, 30, 1);
}
{for(var i = 0, len = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i].getBehavior("Effect").enableEffect("Outline", true);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("_2PlayersButton"), gdjs.MainMenuCode.GD_95952PlayersButtonObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595952PlayersButtonObjects3Objects, runtimeScene, true, true);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i].getBehavior("Effect").isEffectEnabled("Outline") ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[k] = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length = k;
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GD_95952PlayersButtonObjects3 */
{for(var i = 0, len = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i].getBehavior("Effect").enableEffect("Outline", false);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("_2PlayersButton"), gdjs.MainMenuCode.GD_95952PlayersButtonObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18962332);
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[k] = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GD_959595952PlayersButtonObjects3Objects, runtimeScene, true, false);
}
}
}
}
}
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GD_95952PlayersButtonObjects3 */
gdjs.MainMenuCode.GDTransitionToGameObjects3.length = 0;

{gdjs.evtTools.sound.playSound(runtimeScene, "HoverButtonSoundEffect", false, 40, 1.5);
}
{for(var i = 0, len = gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95952PlayersButtonObjects3[i].getBehavior("Animation").setAnimationName("Pressed");
}
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToGameObjects3Objects, 0, 0, "");
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToGameObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToGameObjects3[i].getBehavior("FlashTransitionPainter").PaintEffect("0;0;0", 0.5, "Flash", "Forward", 255, null);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToGameObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToGameObjects3[i].setZOrder(100);
}
}
{gdjs.evtTools.sound.fadeSoundVolume(runtimeScene, 0, 0, 0.3);
}
{gdjs.evtTools.variable.setVariableBoolean(runtimeScene.getGame().getVariables().getFromIndex(0), true);
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("TransitionToGame"), gdjs.MainMenuCode.GDTransitionToGameObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDTransitionToGameObjects2.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDTransitionToGameObjects2[i].getBehavior("FlashTransitionPainter").PaintEffectIsEnd(null) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDTransitionToGameObjects2[k] = gdjs.MainMenuCode.GDTransitionToGameObjects2[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDTransitionToGameObjects2.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18966324);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Game", false);
}
}

}


};gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDBackButtonObjects3Objects = Hashtable.newFrom({"BackButton": gdjs.MainMenuCode.GDBackButtonObjects3});
gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects = Hashtable.newFrom({"TransitionIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects = Hashtable.newFrom({"TransitionToGame": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects = Hashtable.newFrom({"TransitionToControlsIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects = Hashtable.newFrom({"TransitionToControlsOut": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects = Hashtable.newFrom({"TransitionToMainMenu": []});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDBackButtonObjects3Objects = Hashtable.newFrom({"BackButton": gdjs.MainMenuCode.GDBackButtonObjects3});
gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects = Hashtable.newFrom({"TransitionIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects = Hashtable.newFrom({"TransitionToGame": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects = Hashtable.newFrom({"TransitionToControlsIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects = Hashtable.newFrom({"TransitionToControlsOut": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects = Hashtable.newFrom({"TransitionToMainMenu": []});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDBackButtonObjects3Objects = Hashtable.newFrom({"BackButton": gdjs.MainMenuCode.GDBackButtonObjects3});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToMainMenuObjects3Objects = Hashtable.newFrom({"TransitionToMainMenu": gdjs.MainMenuCode.GDTransitionToMainMenuObjects3});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionInObjects2Objects = Hashtable.newFrom({"TransitionIn": gdjs.MainMenuCode.GDTransitionInObjects2});
gdjs.MainMenuCode.eventsList4 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("BackButton"), gdjs.MainMenuCode.GDBackButtonObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDBackButtonObjects3Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDBackButtonObjects3.length;i<l;++i) {
    if ( !(gdjs.MainMenuCode.GDBackButtonObjects3[i].getBehavior("Effect").isEffectEnabled("Outline")) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDBackButtonObjects3[k] = gdjs.MainMenuCode.GDBackButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDBackButtonObjects3.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDBackButtonObjects3.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDBackButtonObjects3[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDBackButtonObjects3[k] = gdjs.MainMenuCode.GDBackButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDBackButtonObjects3.length = k;
}
}
}
}
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GDBackButtonObjects3 */
{gdjs.evtTools.sound.playSound(runtimeScene, "HoverButtonSoundEffect", false, 30, 1);
}
{for(var i = 0, len = gdjs.MainMenuCode.GDBackButtonObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GDBackButtonObjects3[i].getBehavior("Effect").enableEffect("Outline", true);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackButton"), gdjs.MainMenuCode.GDBackButtonObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDBackButtonObjects3Objects, runtimeScene, true, true);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDBackButtonObjects3.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDBackButtonObjects3[i].getBehavior("Effect").isEffectEnabled("Outline") ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDBackButtonObjects3[k] = gdjs.MainMenuCode.GDBackButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDBackButtonObjects3.length = k;
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GDBackButtonObjects3 */
{for(var i = 0, len = gdjs.MainMenuCode.GDBackButtonObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GDBackButtonObjects3[i].getBehavior("Effect").enableEffect("Outline", false);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BackButton"), gdjs.MainMenuCode.GDBackButtonObjects3);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18971892);
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDBackButtonObjects3.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDBackButtonObjects3[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDBackButtonObjects3[k] = gdjs.MainMenuCode.GDBackButtonObjects3[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDBackButtonObjects3.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDBackButtonObjects3Objects, runtimeScene, true, false);
}
}
}
}
}
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GDBackButtonObjects3 */
gdjs.MainMenuCode.GDTransitionToMainMenuObjects3.length = 0;

{gdjs.evtTools.sound.playSound(runtimeScene, "HoverButtonSoundEffect", false, 40, 1.5);
}
{for(var i = 0, len = gdjs.MainMenuCode.GDBackButtonObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GDBackButtonObjects3[i].getBehavior("Animation").setAnimationName("Pressed");
}
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToMainMenuObjects3Objects, 0, 0, "Front");
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToMainMenuObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToMainMenuObjects3[i].getBehavior("FlashTransitionPainter").PaintEffect("0;0;0", 0.2, "Flash", "Forward", 255, null);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToMainMenuObjects3.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToMainMenuObjects3[i].setZOrder(100);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("TransitionToMainMenu"), gdjs.MainMenuCode.GDTransitionToMainMenuObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDTransitionToMainMenuObjects2.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDTransitionToMainMenuObjects2[i].getBehavior("FlashTransitionPainter").PaintEffectIsEnd(null) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDTransitionToMainMenuObjects2[k] = gdjs.MainMenuCode.GDTransitionToMainMenuObjects2[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDTransitionToMainMenuObjects2.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18975468);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("BackButton"), gdjs.MainMenuCode.GDBackButtonObjects2);
gdjs.copyArray(runtimeScene.getObjects("ControlsButton"), gdjs.MainMenuCode.GDControlsButtonObjects2);
gdjs.copyArray(runtimeScene.getObjects("ControlsMenu"), gdjs.MainMenuCode.GDControlsMenuObjects2);
/* Reuse gdjs.MainMenuCode.GDTransitionToMainMenuObjects2 */
gdjs.copyArray(runtimeScene.getObjects("_1PlayerButton"), gdjs.MainMenuCode.GD_95951PlayerButtonObjects2);
gdjs.copyArray(runtimeScene.getObjects("_2PlayersButton"), gdjs.MainMenuCode.GD_95952PlayersButtonObjects2);
gdjs.MainMenuCode.GDTransitionInObjects2.length = 0;

{for(var i = 0, len = gdjs.MainMenuCode.GDControlsMenuObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDControlsMenuObjects2[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDBackButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDBackButtonObjects2[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GD_95951PlayerButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95951PlayerButtonObjects2[i].hide(false);
}
for(var i = 0, len = gdjs.MainMenuCode.GD_95952PlayersButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95952PlayersButtonObjects2[i].hide(false);
}
for(var i = 0, len = gdjs.MainMenuCode.GDControlsButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDControlsButtonObjects2[i].hide(false);
}
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionInObjects2Objects, 0, 0, "Front");
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionInObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionInObjects2[i].getBehavior("FlashTransitionPainter").PaintEffect("0;0;0", 0.2, "Flash", "Backward", 0, null);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionInObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionInObjects2[i].setZOrder(100);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToMainMenuObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToMainMenuObjects2[i].deleteFromScene(runtimeScene);
}
}
}

}


};gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDControlsButtonObjects2Objects = Hashtable.newFrom({"ControlsButton": gdjs.MainMenuCode.GDControlsButtonObjects2});
gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects = Hashtable.newFrom({"TransitionIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects = Hashtable.newFrom({"TransitionToGame": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects = Hashtable.newFrom({"TransitionToControlsIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects = Hashtable.newFrom({"TransitionToControlsOut": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects = Hashtable.newFrom({"TransitionToMainMenu": []});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDControlsButtonObjects2Objects = Hashtable.newFrom({"ControlsButton": gdjs.MainMenuCode.GDControlsButtonObjects2});
gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects = Hashtable.newFrom({"TransitionIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects = Hashtable.newFrom({"TransitionToGame": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects = Hashtable.newFrom({"TransitionToControlsIn": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects = Hashtable.newFrom({"TransitionToControlsOut": []});
gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects = Hashtable.newFrom({"TransitionToMainMenu": []});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDControlsButtonObjects2Objects = Hashtable.newFrom({"ControlsButton": gdjs.MainMenuCode.GDControlsButtonObjects2});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToControlsInObjects2Objects = Hashtable.newFrom({"TransitionToControlsIn": gdjs.MainMenuCode.GDTransitionToControlsInObjects2});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToControlsOutObjects2Objects = Hashtable.newFrom({"TransitionToControlsOut": gdjs.MainMenuCode.GDTransitionToControlsOutObjects2});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDControlsMenuObjects2Objects = Hashtable.newFrom({"ControlsMenu": gdjs.MainMenuCode.GDControlsMenuObjects2});
gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDBackButtonObjects2Objects = Hashtable.newFrom({"BackButton": gdjs.MainMenuCode.GDBackButtonObjects2});
gdjs.MainMenuCode.eventsList5 = function(runtimeScene) {

{



}


{


gdjs.MainMenuCode.eventsList4(runtimeScene);
}


{

gdjs.copyArray(runtimeScene.getObjects("ControlsButton"), gdjs.MainMenuCode.GDControlsButtonObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDControlsButtonObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDControlsButtonObjects2.length;i<l;++i) {
    if ( !(gdjs.MainMenuCode.GDControlsButtonObjects2[i].getBehavior("Effect").isEffectEnabled("Outline")) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDControlsButtonObjects2[k] = gdjs.MainMenuCode.GDControlsButtonObjects2[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDControlsButtonObjects2.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDControlsButtonObjects2.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDControlsButtonObjects2[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDControlsButtonObjects2[k] = gdjs.MainMenuCode.GDControlsButtonObjects2[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDControlsButtonObjects2.length = k;
}
}
}
}
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GDControlsButtonObjects2 */
{gdjs.evtTools.sound.playSound(runtimeScene, "HoverButtonSoundEffect", false, 30, 1);
}
{for(var i = 0, len = gdjs.MainMenuCode.GDControlsButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDControlsButtonObjects2[i].getBehavior("Effect").enableEffect("Outline", true);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("ControlsButton"), gdjs.MainMenuCode.GDControlsButtonObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDControlsButtonObjects2Objects, runtimeScene, true, true);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDControlsButtonObjects2.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDControlsButtonObjects2[i].getBehavior("Effect").isEffectEnabled("Outline") ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDControlsButtonObjects2[k] = gdjs.MainMenuCode.GDControlsButtonObjects2[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDControlsButtonObjects2.length = k;
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GDControlsButtonObjects2 */
{for(var i = 0, len = gdjs.MainMenuCode.GDControlsButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDControlsButtonObjects2[i].getBehavior("Effect").enableEffect("Outline", false);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("ControlsButton"), gdjs.MainMenuCode.GDControlsButtonObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18980812);
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToGameObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsInObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToControlsOutObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.object.getSceneInstancesCount(runtimeScene, gdjs.MainMenuCode.mapOfEmptyGDTransitionToMainMenuObjects) == 0;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDControlsButtonObjects2.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDControlsButtonObjects2[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDControlsButtonObjects2[k] = gdjs.MainMenuCode.GDControlsButtonObjects2[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDControlsButtonObjects2.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDControlsButtonObjects2Objects, runtimeScene, true, false);
}
}
}
}
}
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GDControlsButtonObjects2 */
gdjs.MainMenuCode.GDTransitionToControlsInObjects2.length = 0;

{gdjs.evtTools.sound.playSound(runtimeScene, "HoverButtonSoundEffect", false, 40, 1.5);
}
{for(var i = 0, len = gdjs.MainMenuCode.GDControlsButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDControlsButtonObjects2[i].getBehavior("Animation").setAnimationName("Pressed");
}
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToControlsInObjects2Objects, 0, 0, "Front");
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToControlsInObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToControlsInObjects2[i].getBehavior("FlashTransitionPainter").PaintEffect("0;0;0", 0.2, "Flash", "Forward", 255, null);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToControlsInObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToControlsInObjects2[i].setZOrder(100);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("TransitionToControlsIn"), gdjs.MainMenuCode.GDTransitionToControlsInObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDTransitionToControlsInObjects2.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDTransitionToControlsInObjects2[i].getBehavior("FlashTransitionPainter").PaintEffectIsEnd(null) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDTransitionToControlsInObjects2[k] = gdjs.MainMenuCode.GDTransitionToControlsInObjects2[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDTransitionToControlsInObjects2.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18984852);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("ControlsButton"), gdjs.MainMenuCode.GDControlsButtonObjects2);
/* Reuse gdjs.MainMenuCode.GDTransitionToControlsInObjects2 */
gdjs.copyArray(runtimeScene.getObjects("_1PlayerButton"), gdjs.MainMenuCode.GD_95951PlayerButtonObjects2);
gdjs.copyArray(runtimeScene.getObjects("_2PlayersButton"), gdjs.MainMenuCode.GD_95952PlayersButtonObjects2);
gdjs.MainMenuCode.GDBackButtonObjects2.length = 0;

gdjs.MainMenuCode.GDControlsMenuObjects2.length = 0;

gdjs.MainMenuCode.GDTransitionToControlsOutObjects2.length = 0;

{for(var i = 0, len = gdjs.MainMenuCode.GD_95951PlayerButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95951PlayerButtonObjects2[i].hide();
}
for(var i = 0, len = gdjs.MainMenuCode.GD_95952PlayersButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GD_95952PlayersButtonObjects2[i].hide();
}
for(var i = 0, len = gdjs.MainMenuCode.GDControlsButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDControlsButtonObjects2[i].hide();
}
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionToControlsOutObjects2Objects, 0, 0, "Front");
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToControlsOutObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToControlsOutObjects2[i].getBehavior("FlashTransitionPainter").PaintEffect("0;0;0", 0.2, "Flash", "Backward", 0, null);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToControlsOutObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToControlsOutObjects2[i].setZOrder(100);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToControlsInObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToControlsInObjects2[i].deleteFromScene(runtimeScene);
}
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDControlsMenuObjects2Objects, 320, 180, "Front");
}
{for(var i = 0, len = gdjs.MainMenuCode.GDControlsMenuObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDControlsMenuObjects2[i].setZOrder(1);
}
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDBackButtonObjects2Objects, 24, 333, "");
}
{for(var i = 0, len = gdjs.MainMenuCode.GDBackButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDBackButtonObjects2[i].setZOrder(1);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDControlsButtonObjects2.length ;i < len;++i) {
    gdjs.MainMenuCode.GDControlsButtonObjects2[i].getBehavior("Animation").setAnimationName("Idle");
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("TransitionToControlsOut"), gdjs.MainMenuCode.GDTransitionToControlsOutObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDTransitionToControlsOutObjects1.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDTransitionToControlsOutObjects1[i].getBehavior("FlashTransitionPainter").PaintEffectIsEnd(null) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDTransitionToControlsOutObjects1[k] = gdjs.MainMenuCode.GDTransitionToControlsOutObjects1[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDTransitionToControlsOutObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18987844);
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GDTransitionToControlsOutObjects1 */
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionToControlsOutObjects1.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionToControlsOutObjects1[i].deleteFromScene(runtimeScene);
}
}
}

}


};gdjs.MainMenuCode.eventsList6 = function(runtimeScene) {

{


gdjs.MainMenuCode.eventsList2(runtimeScene);
}


{


gdjs.MainMenuCode.eventsList3(runtimeScene);
}


{


gdjs.MainMenuCode.eventsList5(runtimeScene);
}


};gdjs.MainMenuCode.eventsList7 = function(runtimeScene) {

{



}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.MainMenuCode.GDTransitionInObjects1.length = 0;

{gdjs.evtTools.window.setFullScreen(runtimeScene, true, true);
}
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "MainMenu.ogg", 0, true, 60, 1);
}
{gdjs.evtTools.object.createObjectOnScene(runtimeScene, gdjs.MainMenuCode.mapOfGDgdjs_9546MainMenuCode_9546GDTransitionInObjects1Objects, 0, 0, "");
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionInObjects1.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionInObjects1[i].getBehavior("FlashTransitionPainter").PaintEffect("0;0;0", 0.3, "Flash", "Backward", 0, null);
}
}
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionInObjects1.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionInObjects1[i].setZOrder(100);
}
}
{gdjs.evtTools.variable.setVariableBoolean(runtimeScene.getGame().getVariables().getFromIndex(0), false);
}

{ //Subevents
gdjs.MainMenuCode.eventsList0(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("TransitionIn"), gdjs.MainMenuCode.GDTransitionInObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MainMenuCode.GDTransitionInObjects1.length;i<l;++i) {
    if ( gdjs.MainMenuCode.GDTransitionInObjects1[i].getBehavior("FlashTransitionPainter").PaintEffectIsEnd(null) ) {
        isConditionTrue_0 = true;
        gdjs.MainMenuCode.GDTransitionInObjects1[k] = gdjs.MainMenuCode.GDTransitionInObjects1[i];
        ++k;
    }
}
gdjs.MainMenuCode.GDTransitionInObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(18844916);
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MainMenuCode.GDTransitionInObjects1 */
{for(var i = 0, len = gdjs.MainMenuCode.GDTransitionInObjects1.length ;i < len;++i) {
    gdjs.MainMenuCode.GDTransitionInObjects1[i].deleteFromScene(runtimeScene);
}
}
}

}


{


gdjs.MainMenuCode.eventsList1(runtimeScene);
}


{


gdjs.MainMenuCode.eventsList6(runtimeScene);
}


};

gdjs.MainMenuCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.MainMenuCode.GDBackgroundObjects1.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects2.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects3.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects4.length = 0;
gdjs.MainMenuCode.GDMoonLightObjects1.length = 0;
gdjs.MainMenuCode.GDMoonLightObjects2.length = 0;
gdjs.MainMenuCode.GDMoonLightObjects3.length = 0;
gdjs.MainMenuCode.GDMoonLightObjects4.length = 0;
gdjs.MainMenuCode.GD_95951PlayerButtonObjects1.length = 0;
gdjs.MainMenuCode.GD_95951PlayerButtonObjects2.length = 0;
gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length = 0;
gdjs.MainMenuCode.GD_95951PlayerButtonObjects4.length = 0;
gdjs.MainMenuCode.GD_95952PlayersButtonObjects1.length = 0;
gdjs.MainMenuCode.GD_95952PlayersButtonObjects2.length = 0;
gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length = 0;
gdjs.MainMenuCode.GD_95952PlayersButtonObjects4.length = 0;
gdjs.MainMenuCode.GDButtonsLightsObjects1.length = 0;
gdjs.MainMenuCode.GDButtonsLightsObjects2.length = 0;
gdjs.MainMenuCode.GDButtonsLightsObjects3.length = 0;
gdjs.MainMenuCode.GDButtonsLightsObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionInObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionInObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionInObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionInObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionToGameObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionToGameObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionToGameObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionToGameObjects4.length = 0;
gdjs.MainMenuCode.GDBackButtonObjects1.length = 0;
gdjs.MainMenuCode.GDBackButtonObjects2.length = 0;
gdjs.MainMenuCode.GDBackButtonObjects3.length = 0;
gdjs.MainMenuCode.GDBackButtonObjects4.length = 0;
gdjs.MainMenuCode.GDControlsButtonObjects1.length = 0;
gdjs.MainMenuCode.GDControlsButtonObjects2.length = 0;
gdjs.MainMenuCode.GDControlsButtonObjects3.length = 0;
gdjs.MainMenuCode.GDControlsButtonObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsInObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsInObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsInObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsInObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsOutObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsOutObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsOutObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsOutObjects4.length = 0;
gdjs.MainMenuCode.GDControlsMenuObjects1.length = 0;
gdjs.MainMenuCode.GDControlsMenuObjects2.length = 0;
gdjs.MainMenuCode.GDControlsMenuObjects3.length = 0;
gdjs.MainMenuCode.GDControlsMenuObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionToMainMenuObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionToMainMenuObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionToMainMenuObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionToMainMenuObjects4.length = 0;
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects1.length = 0;
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects2.length = 0;
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects3.length = 0;
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects4.length = 0;

gdjs.MainMenuCode.eventsList7(runtimeScene);
gdjs.MainMenuCode.GDBackgroundObjects1.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects2.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects3.length = 0;
gdjs.MainMenuCode.GDBackgroundObjects4.length = 0;
gdjs.MainMenuCode.GDMoonLightObjects1.length = 0;
gdjs.MainMenuCode.GDMoonLightObjects2.length = 0;
gdjs.MainMenuCode.GDMoonLightObjects3.length = 0;
gdjs.MainMenuCode.GDMoonLightObjects4.length = 0;
gdjs.MainMenuCode.GD_95951PlayerButtonObjects1.length = 0;
gdjs.MainMenuCode.GD_95951PlayerButtonObjects2.length = 0;
gdjs.MainMenuCode.GD_95951PlayerButtonObjects3.length = 0;
gdjs.MainMenuCode.GD_95951PlayerButtonObjects4.length = 0;
gdjs.MainMenuCode.GD_95952PlayersButtonObjects1.length = 0;
gdjs.MainMenuCode.GD_95952PlayersButtonObjects2.length = 0;
gdjs.MainMenuCode.GD_95952PlayersButtonObjects3.length = 0;
gdjs.MainMenuCode.GD_95952PlayersButtonObjects4.length = 0;
gdjs.MainMenuCode.GDButtonsLightsObjects1.length = 0;
gdjs.MainMenuCode.GDButtonsLightsObjects2.length = 0;
gdjs.MainMenuCode.GDButtonsLightsObjects3.length = 0;
gdjs.MainMenuCode.GDButtonsLightsObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionInObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionInObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionInObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionInObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionToGameObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionToGameObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionToGameObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionToGameObjects4.length = 0;
gdjs.MainMenuCode.GDBackButtonObjects1.length = 0;
gdjs.MainMenuCode.GDBackButtonObjects2.length = 0;
gdjs.MainMenuCode.GDBackButtonObjects3.length = 0;
gdjs.MainMenuCode.GDBackButtonObjects4.length = 0;
gdjs.MainMenuCode.GDControlsButtonObjects1.length = 0;
gdjs.MainMenuCode.GDControlsButtonObjects2.length = 0;
gdjs.MainMenuCode.GDControlsButtonObjects3.length = 0;
gdjs.MainMenuCode.GDControlsButtonObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsInObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsInObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsInObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsInObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsOutObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsOutObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsOutObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionToControlsOutObjects4.length = 0;
gdjs.MainMenuCode.GDControlsMenuObjects1.length = 0;
gdjs.MainMenuCode.GDControlsMenuObjects2.length = 0;
gdjs.MainMenuCode.GDControlsMenuObjects3.length = 0;
gdjs.MainMenuCode.GDControlsMenuObjects4.length = 0;
gdjs.MainMenuCode.GDTransitionToMainMenuObjects1.length = 0;
gdjs.MainMenuCode.GDTransitionToMainMenuObjects2.length = 0;
gdjs.MainMenuCode.GDTransitionToMainMenuObjects3.length = 0;
gdjs.MainMenuCode.GDTransitionToMainMenuObjects4.length = 0;
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects1.length = 0;
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects2.length = 0;
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects3.length = 0;
gdjs.MainMenuCode.GDGumbuo_9595FightersObjects4.length = 0;


return;

}

gdjs['MainMenuCode'] = gdjs.MainMenuCode;
