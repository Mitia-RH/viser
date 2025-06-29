import * as React from "react";
import { useDisclosure } from "@mantine/hooks";
import { GuiFolderTreeMessage } from "../WebsocketMessages";
import { IconChevronDown, IconChevronUp, IconEye, IconEyeOff, IconSettings } from "@tabler/icons-react";
import { Box, Collapse, Paper, ActionIcon, Group } from "@mantine/core";
import { GuiComponentContext } from "../ControlPanel/GuiComponentContext";
import { ViewerContext } from "../ViewerContext";
import { folderLabel, folderToggleIcon, folderWrapper } from "./Folder.css";

/**
 * Component styles for FolderTree
 */
export const folderTreeEyeButton = {
  height: "1.25rem",
  width: "1.25rem",
  marginLeft: "auto",
  marginRight: "0.25rem",
};

export const folderTreePropertiesButton = {
  height: "1.25rem",
  width: "1.25rem",
  marginRight: "0.25rem",
};

/**
 * FolderTree component that provides a hierarchical structure with visibility toggles
 */
export default function FolderTreeComponent({
  uuid,
  props: { label, visible, expand_by_default, visibility_state },
  nextGuiUuid,
}: GuiFolderTreeMessage & { nextGuiUuid: string | null }) {
  const viewer = React.useContext(ViewerContext)!;
  const [opened, { toggle }] = useDisclosure(expand_by_default);
  const [isVisible, setIsVisible] = React.useState(visibility_state);
  const [showProperties, setShowProperties] = React.useState(false);
  
  const guiIdSet = viewer.useGui(
    (state) => state.guiUuidSetFromContainerUuid[uuid],
  );
  const guiContext = React.useContext(GuiComponentContext)!;
  const isEmpty = guiIdSet === undefined || Object.keys(guiIdSet).length === 0;
  const nextGuiType = viewer.useGui((state) =>
    nextGuiUuid == null ? null : state.guiConfigFromUuid[nextGuiUuid]?.type,
  );

  const updateChildrenVisibility = React.useCallback((idSet: Record<string, boolean>, newState: boolean) => {
    Object.keys(idSet).forEach(childId => {
      const childConfig = viewer.useGui.getState().guiConfigFromUuid[childId];
      
      if (!childConfig) return;
      
      // Check current props to see what properties are available
      const currentProps = childConfig.props;
      
      // Handle different component types with appropriate properties
      switch (childConfig.type) {
        case "GuiFolderTreeMessage": {
          // For folder trees, update visibility_state
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
            guiContext.messageSender({
              type: "GuiUpdateMessage",
              uuid: childId,
              updates: { visible: newState },
            });
          } else if ('disabled' in currentProps) {
            guiContext.messageSender({
              type: "GuiUpdateMessage",
              uuid: childId,
              updates: { disabled: !newState },
            });
          } else {
            console.warn(`Component ${childId} of type ${childConfig.type} has no visible or disabled property`);
          }
          break;
        }
      }
    });
  }, [guiContext, viewer]);

  const toggleVisibility = React.useCallback(() => {
    const newVisibilityState = !isVisible;
    setIsVisible(newVisibilityState);
    
    // Update this folder tree's visibility state
    guiContext.messageSender({
      type: "GuiUpdateMessage",
      uuid: uuid,
      updates: { visibility_state: newVisibilityState },
    });
    
    if (guiIdSet) {
      updateChildrenVisibility(guiIdSet, newVisibilityState);
    }
  }, [isVisible, uuid, guiIdSet, guiContext, updateChildrenVisibility]);

  const toggleProperties = React.useCallback(() => {
    setShowProperties(!showProperties);
  }, [showProperties]);

  const ToggleIcon = opened ? IconChevronUp : IconChevronDown;
  const VisibilityIcon = isVisible ? IconEye : IconEyeOff;

  if (!visible) return null;
  
  return (
    <Paper
      withBorder
      className={folderWrapper}
      mb={nextGuiType === "GuiFolderTreeMessage" ? "md" : undefined}
    >
      <Paper className={folderLabel} style={{ cursor: isEmpty ? undefined : "pointer" }}>
        <Group spacing="xs" style={{ width: "100%" }} position="apart">
          <Box onClick={toggle} style={{ flexGrow: 1, cursor: "pointer" }}>
            {label}
          </Box>
          
          <Group spacing="xs">
            <ActionIcon 
              size="sm" 
              style={folderTreeEyeButton}
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide contents" : "Show contents"}
            >
              <VisibilityIcon size="1rem" />
            </ActionIcon>
            
            <ActionIcon 
              size="sm" 
              style={folderTreePropertiesButton}
              onClick={toggleProperties}
              aria-label="Properties"
            >
              <IconSettings size="1rem" />
            </ActionIcon>
            
            {!isEmpty && (
              <ToggleIcon
                className={folderToggleIcon}
                style={{
                  display: isEmpty ? "none" : undefined,
                }}
              />
            )}
          </Group>
        </Group>
      </Paper>
      
      {/* Properties panel */}
      <Collapse in={showProperties}>
        <Box p="xs" style={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}>
          <Box>Properties placeholder</Box>
        </Box>
      </Collapse>
      
      {/* Child content */}
      <Collapse in={opened && !isEmpty}>
        <Box pt="0.2em" style={{ opacity: isVisible ? 1 : 0.5, pointerEvents: isVisible ? "auto" : "none" }}>
          <GuiComponentContext.Provider
            value={{
              ...guiContext,
              folderDepth: guiContext.folderDepth + 1,
            }}
          >
            <guiContext.GuiContainer containerUuid={uuid} />
          </GuiComponentContext.Provider>
        </Box>
      </Collapse>
      
      <Collapse in={!(opened && !isEmpty)}>
        <Box p="xs"></Box>
      </Collapse>
    </Paper>
  );
}
