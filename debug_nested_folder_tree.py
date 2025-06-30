import viser
import traceback
import time

def main():
    try:
        print("Creating server...")
        server = viser.ViserServer()
        
        print("Creating folder tree...")
        folder_tree = server.gui.add_folder_tree(
            label="Test FolderTree",
            expand_by_default=True,
            visible=True,
            visibility_state=True
        )
        print("✅ FolderTree created successfully!")
        
        print("Entering folder tree context...")
        with folder_tree:
            print("Inside folder tree context")
            
            print("Creating nested folder tree...")
            nested_folder_tree = server.gui.add_folder_tree(
                label="Subfolder 1",
                expand_by_default=True,
                visible=True,
                visibility_state=True
            )
            print("✅ Nested FolderTree created successfully!")
            
            print("Entering nested folder tree context...")
            with nested_folder_tree:
                print("Inside nested folder tree context")
                
                print("Creating button inside nested context...")
                button = server.gui.add_button("Test Button")
                print("✅ Button created successfully!")
                
                print("Exiting nested context...")
            print("Exited nested context")
            
            print("Exiting outer context...")
        print("Exited outer context")
        
        print("All done! Running for 5 seconds...")
        time.sleep(5)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()
