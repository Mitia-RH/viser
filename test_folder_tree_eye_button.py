#!/usr/bin/env python3

import asyncio
import time
import viser

def test_folder_tree_eye_button():
    """Test that clicking the eye button on FolderTree doesn't cause assertion errors."""
    server = viser.ViserServer()
    
    print("Creating folder tree with children...")
    
    # Create a folder tree
    with server.gui.add_folder_tree(
        "Test FolderTree",
        expand_by_default=True,
        visibility_state=True
    ) as folder_tree:
        # Add various types of GUI elements as children
        button1 = server.gui.add_button("Test Button 1")
        button2 = server.gui.add_button("Test Button 2", disabled=True)
        slider = server.gui.add_slider("Test Slider", min=0, max=100, step=1, initial_value=50)
        text_input = server.gui.add_text("Text Input", initial_value="Hello")
        checkbox = server.gui.add_checkbox("Checkbox", initial_value=True)
        
        print("Children created successfully!")
        
        # Test that all children have the necessary properties synced to handle_state
        test_elements = [
            ("button1", button1),
            ("button2", button2), 
            ("slider", slider),
            ("text_input", text_input),
            ("checkbox", checkbox)
        ]
        
        for name, element in test_elements:
            handle_state = element._impl
            print(f"Checking {name}:")
            print(f"  - has 'visible' attr: {hasattr(handle_state, 'visible')}")
            print(f"  - has 'disabled' attr: {hasattr(handle_state, 'disabled')}")
            if hasattr(handle_state, 'visible'):
                print(f"  - visible value: {handle_state.visible}")
            if hasattr(handle_state, 'disabled'):
                print(f"  - disabled value: {handle_state.disabled}")
        
        # Now simulate what happens when the eye button is clicked
        # This is what the FolderTree.tsx component would send
        print("\nSimulating eye button click (toggling visibility)...")
        
        try:
            # Simulate GUI updates that would be sent by the FolderTree eye button
            from viser._messages import GuiUpdateMessage
            from viser.infra import ClientId
            
            # Create a dummy client ID
            dummy_client_id = ClientId(0)
            
            # Test updating visible property (what display components get)
            for name, element in test_elements:
                if hasattr(element._impl, 'visible'):
                    print(f"Testing visible update for {name}...")
                    update_msg = GuiUpdateMessage(
                        uuid=element._impl.uuid,
                        updates={"visible": False}
                    )
                    # This is what would trigger the assertion error
                    asyncio.run(server.gui._handle_gui_updates(dummy_client_id, update_msg))
                    print(f"  ✓ visible update succeeded for {name}")
            
            # Test updating disabled property (what input components get)
            for name, element in test_elements:
                if hasattr(element._impl, 'disabled'):
                    print(f"Testing disabled update for {name}...")
                    update_msg = GuiUpdateMessage(
                        uuid=element._impl.uuid,
                        updates={"disabled": True}
                    )
                    # This is what would trigger the assertion error
                    asyncio.run(server.gui._handle_gui_updates(dummy_client_id, update_msg))
                    print(f"  ✓ disabled update succeeded for {name}")
                    
            print("\n✅ All GUI updates succeeded! The eye button fix is working.")
            
        except AssertionError as e:
            print(f"\n❌ AssertionError occurred: {e}")
            print("The fix did not work properly.")
            return False
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            return False
    
    print("\nTest completed successfully!")
    return True

if __name__ == "__main__":
    success = test_folder_tree_eye_button()
    if not success:
        exit(1)
