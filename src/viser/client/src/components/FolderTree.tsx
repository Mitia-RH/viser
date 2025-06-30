import * as React from "react";
import { useDisclosure } from "@mantine/hooks";
import { GuiFolderTreeMessage } from "../WebsocketMessages";
import { IconEye, IconEyeOff, IconSettings, IconCaretDown, IconCaretRight } from "@tabler/icons-react";
import { Box, Collapse} from "@mantine/core";
import { GuiComponentContext } from "../ControlPanel/GuiComponentContext";
import { ViewerContext } from "../ViewerContext";
import { useFolderTreeVisibility } from "./FolderTreeManager";

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
  const [showProperties, setShowProperties] = React.useState(false);
  
  const guiIdSet = viewer.useGui(
    (state) => state.guiUuidSetFromContainerUuid[uuid],
  );
  const guiContext = React.useContext(GuiComponentContext)!;
  const isEmpty = guiIdSet === undefined || Object.keys(guiIdSet).length === 0;
  const nextGuiType = viewer.useGui((state) =>
    nextGuiUuid == null ? null : state.guiConfigFromUuid[nextGuiUuid]?.type,
  );

  // Use the custom hook for visibility management
  const { isVisible, toggleVisibility } = useFolderTreeVisibility(
    uuid,
    visibility_state,
    guiIdSet
  );

  const toggleProperties = React.useCallback(() => {
    setShowProperties(!showProperties);
  }, [showProperties]);

  const VisibilityIcon = isVisible ? IconEye : IconEyeOff;

  if (!visible) return null;
  
  return (
    <Box mb={nextGuiType === "GuiFolderTreeMessage" ? "md" : undefined}>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.2em",
          padding: "0 0.25em",
          lineHeight: "2em",
          fontSize: "0.875em",
          width: "100%",
          paddingLeft: `${0.25 + (guiContext.folderDepth * 1.2)}em`, // Add indentation based on depth
        }}
        sx={(theme) => ({
          "&:hover": {
            backgroundColor: theme.colorScheme === 'dark' 
              ? theme.colors.dark[6] 
              : theme.colors.gray[1],
          },
        })}
      >
        {/* Expand/collapse arrow - matches scene tree exactly */}
        <Box
          style={{
            opacity: !isEmpty ? 0.7 : 0.1,
            cursor: !isEmpty ? "pointer" : "default",
          }}
          onClick={!isEmpty ? toggle : undefined}
        >
          {opened ? (
            <IconCaretDown
              style={{
                height: "1em",
                width: "1em",
                transform: "translateY(0.1em)",
              }}
            />
          ) : (
            <IconCaretRight
              style={{
                height: "1em",
                width: "1em",
                transform: "translateY(0.1em)",
              }}
            />
          )}
        </Box>
        
        {/* Visibility eye icon - matches scene tree size and behavior */}
        <Box style={{ width: "1.5em", height: "1.5em" }}>
          <VisibilityIcon
            style={{
              cursor: "pointer",
              opacity: isVisible ? 0.85 : 0.25,
              width: "1.5em",
              height: "1.5em",
              display: "block",
            }}
            onClick={toggleVisibility}
          />
        </Box>
        
        {/* Folder name - grows to fill space, clickable for expand/collapse */}
        <Box 
          style={{ 
            flexGrow: 1, 
            userSelect: "none",
            cursor: !isEmpty ? "pointer" : "default",
          }}
          onClick={!isEmpty ? toggle : undefined}
        >
          {label}
        </Box>
        
        {/* Settings button on the far right - matches scene tree styling */}
        <Box style={{ width: "1.25em", height: "1.25em" }}>
          <IconSettings
            style={{
              cursor: "pointer",
              width: "1.25em",
              height: "1.25em",
              display: "block",
              opacity: 0.7,
            }}
            onClick={toggleProperties}
          />
        </Box>
      </Box>
      
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
    </Box>
  );
}
