/**
 * FolderTreeManager - Handles hierarchical visibility management for FolderTree components
 */
import React from "react";
import { GuiComponentContext } from "../ControlPanel/GuiComponentContext";
import { ViewerContext } from "../ViewerContext";

/**
 * Custom hook to manage FolderTree visibility with proper hierarchical updates
 */
export function useFolderTreeVisibility(
  uuid: string,
  initialVisibilityState: boolean,
  guiIdSet: Record<string, boolean> | undefined
) {
  const viewer = React.useContext(ViewerContext)!;
  const guiContext = React.useContext(GuiComponentContext)!;
  
  // Subscribe to the visibility_state from Zustand store
  const storeVisibilityState = viewer.useGui((state) => {
    const config = state.guiConfigFromUuid[uuid];
    if (config?.type === "GuiFolderTreeMessage") {
      return config.props.visibility_state;
    }
    return initialVisibilityState;
  });
  
  // Use the store state directly instead of maintaining local state
  const [localVisible, setLocalVisible] = React.useState(storeVisibilityState);
  
  // Sync with store changes
  React.useEffect(() => {
    setLocalVisible(storeVisibilityState);
  }, [storeVisibilityState]);
  
  const updateChildrenVisibility = React.useCallback((idSet: Record<string, boolean>, newState: boolean) => {
    Object.keys(idSet).forEach(childId => {
      const childConfig = viewer.useGui.getState().guiConfigFromUuid[childId];
      
      if (!childConfig) return;
      
      // Check current props to see what properties are available
      const currentProps = childConfig.props;
      
      // Handle different component types with appropriate properties
      switch (childConfig.type) {
        case "GuiFolderTreeMessage": {
          // For folder trees, update visibility_state directly in the store
          viewer.useGui.getState().updateGuiProps(childId, { visibility_state: newState });
          
          // Also send the update message to sync with the server
          guiContext.messageSender({
            type: "GuiUpdateMessage",
            uuid: childId,
            updates: { visibility_state: newState },
          });
          
          // Recursively update nested folder trees
          const childIdSet = viewer.useGui.getState().guiUuidSetFromContainerUuid[childId];
          if (childIdSet) {
            updateChildrenVisibility(childIdSet, newState);
          }
          break;
        }
        case "GuiFolderMessage":
        case "GuiTabGroupMessage": {
          // For container components, update visible property
          if ('visible' in currentProps) {
            viewer.useGui.getState().updateGuiProps(childId, { visible: newState });
            guiContext.messageSender({
              type: "GuiUpdateMessage",
              uuid: childId,
              updates: { visible: newState },
            });
          }
          break;
        }
        case "GuiButtonMessage":
        case "GuiSliderMessage":
        case "GuiNumberMessage":
        case "GuiTextMessage":
        case "GuiCheckboxMessage":
        case "GuiDropdownMessage":
        case "GuiButtonGroupMessage":
        case "GuiVector2Message":
        case "GuiVector3Message":
        case "GuiRgbMessage":
        case "GuiRgbaMessage":
        case "GuiMultiSliderMessage":
        case "GuiUploadButtonMessage": {
          // For input components that extend GuiBaseProps, they have both visible and disabled
          if ('disabled' in currentProps) {
            viewer.useGui.getState().updateGuiProps(childId, { disabled: !newState });
            guiContext.messageSender({
              type: "GuiUpdateMessage",
              uuid: childId,
              updates: { disabled: !newState },
            });
          }
          break;
        }
        case "GuiMarkdownMessage":
        case "GuiHtmlMessage":
        case "GuiPlotlyMessage":
        case "GuiImageMessage":
        case "GuiProgressBarMessage":
        case "GuiUplotMessage": {
          // For display components, try visible first
          if ('visible' in currentProps) {
            viewer.useGui.getState().updateGuiProps(childId, { visible: newState });
            guiContext.messageSender({
              type: "GuiUpdateMessage",
              uuid: childId,
              updates: { visible: newState },
            });
          }
          break;
        }
        default: {
          // For unknown components, try visible first, then disabled
          if ('visible' in currentProps) {
            viewer.useGui.getState().updateGuiProps(childId, { visible: newState });
            guiContext.messageSender({
              type: "GuiUpdateMessage",
              uuid: childId,
              updates: { visible: newState },
            });
          } else if ('disabled' in currentProps) {
            viewer.useGui.getState().updateGuiProps(childId, { disabled: !newState });
            guiContext.messageSender({
              type: "GuiUpdateMessage",
              uuid: childId,
              updates: { disabled: !newState },
            });
          } else {
            console.warn(`Component ${childId} has no visible or disabled property`);
          }
          break;
        }
      }
    });
  }, [guiContext, viewer]);

  const toggleVisibility = React.useCallback(() => {
    const newVisibilityState = !localVisible;
    
    // Update the store immediately for instant UI feedback
    viewer.useGui.getState().updateGuiProps(uuid, { visibility_state: newVisibilityState });
    
    // Update this folder tree's visibility state on the server
    guiContext.messageSender({
      type: "GuiUpdateMessage",
      uuid: uuid,
      updates: { visibility_state: newVisibilityState },
    });
    
    // Update children
    if (guiIdSet) {
      updateChildrenVisibility(guiIdSet, newVisibilityState);
    }
  }, [localVisible, uuid, guiIdSet, guiContext, updateChildrenVisibility, viewer]);

  return {
    isVisible: localVisible,
    toggleVisibility,
  };
}
