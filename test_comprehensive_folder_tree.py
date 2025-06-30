#!/usr/bin/env python3

import asyncio
import viser
from viser._messages import GuiUpdateMessage
from viser.infra import ClientId

def test_folder_tree_comprehensive():
    """Comprehensive test for FolderTree eye button functionality."""
    server = viser.ViserServer()
    
    print("🧪 Running comprehensive FolderTree test...")
    
    # Test 1: Basic FolderTree with various children
    print("\n Testing basic FolderTree with various children...")
    with server.gui.add_folder_tree("Main Tree", visibility_state=True) as main_tree:
        button = server.gui.add_button("Test Button")
        slider = server.gui.add_slider("Test Slider", min=0, max=100, step=1, initial_value=50)
        checkbox = server.gui.add_checkbox("Test Checkbox", initial_value=False)
        text = server.gui.add_text("Test Text", initial_value="hello")
        
        # Test that properties are synced
        elements = [("button", button), ("slider", slider), ("checkbox", checkbox), ("text", text)]
        for name, element in elements:
            assert hasattr(element._impl, 'visible'), f"{name} missing visible property"
            assert hasattr(element._impl, 'disabled'), f"{name} missing disabled property"
            print(f"  {name} has required properties")
    
    # Test 2: Nested FolderTree
    print("\n Testing nested FolderTree...")
    with server.gui.add_folder_tree("Outer Tree", visibility_state=True) as outer_tree:
        outer_button = server.gui.add_button("Outer Button")
        
        with server.gui.add_folder_tree("Inner Tree", visibility_state=True) as inner_tree:
            inner_button = server.gui.add_button("Inner Button")
            inner_slider = server.gui.add_slider("Inner Slider", min=0, max=10, step=1, initial_value=5)
            
            # Test nested elements have properties
            nested_elements = [("outer_button", outer_button), ("inner_button", inner_button), ("inner_slider", inner_slider)]
            for name, element in nested_elements:
                assert hasattr(element._impl, 'visible'), f"{name} missing visible property"
                assert hasattr(element._impl, 'disabled'), f"{name} missing disabled property"
                print(f"  {name} has required properties")
    
    # Test 3: Simulate FolderTree eye button clicks
    print("\n Testing simulated eye button interactions...")
    test_elements = [button, slider, checkbox, text, outer_button, inner_button, inner_slider]
    dummy_client_id = ClientId(0)
    
    for i, element in enumerate(test_elements):
        # Test visible property update (what display components receive)
        try:
            update_msg = GuiUpdateMessage(
                uuid=element._impl.uuid,
                updates={"visible": False}
            )
            asyncio.run(server.gui._handle_gui_updates(dummy_client_id, update_msg))
            print(f"  Element {i+1} visible update succeeded")
        except Exception as e:
            print(f"  Element {i+1} visible update failed: {e}")
            return False
        
        # Test disabled property update (what input components receive)
        try:
            update_msg = GuiUpdateMessage(
                uuid=element._impl.uuid,
                updates={"disabled": True}
            )
            asyncio.run(server.gui._handle_gui_updates(dummy_client_id, update_msg))
            print(f"  Element {i+1} disabled update succeeded")
        except Exception as e:
            print(f"  Element {i+1} disabled update failed: {e}")
            return False
    
    # Test 4: Mixed updates (what FolderTree.tsx actually sends)
    print("\n Testing mixed property updates...")
    for i, element in enumerate(test_elements):
        try:
            # This simulates what FolderTree.tsx does for different component types
            if hasattr(element._impl.props, 'disabled'):
                # Input components get disabled updates
                update_msg = GuiUpdateMessage(
                    uuid=element._impl.uuid,
                    updates={"disabled": not element._impl.disabled}
                )
            else:
                # Display components get visible updates
                update_msg = GuiUpdateMessage(
                    uuid=element._impl.uuid,
                    updates={"visible": not element._impl.visible}
                )
            
            asyncio.run(server.gui._handle_gui_updates(dummy_client_id, update_msg))
            print(f" Element {i+1} mixed update succeeded")
        except Exception as e:
            print(f" Element {i+1} mixed update failed: {e}")
            return False
    
    print("\n All tests passed! FolderTree eye button fix is working correctly.")
    print("🎉 The AssertionError when clicking the eye button has been resolved!")
    return True

if __name__ == "__main__":
    success = test_folder_tree_comprehensive()
    if not success:
        print("\n Tests failed!")
        exit(1)
    else:
        print("\n All tests passed successfully!")
