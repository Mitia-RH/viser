import viser
import time

def main():
    server = viser.ViserServer()
    
    # Test basic folder tree creation
    print("Creating folder tree...")
    
    folder_tree = server.gui.add_folder_tree(
        label="Test FolderTree",
        expand_by_default=True,
        visible=True,
        visibility_state=True
    )
    
    print("✅ FolderTree created successfully!")
    print("Server running at: http://localhost:8080")
    print("Check if the FolderTree appears in the GUI panel...")
    
    with folder_tree:
        button = server.gui.add_button("Test Button")
        print("✅ Added button inside FolderTree")
    
    try:
        while True:
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("Server stopped.")

if __name__ == "__main__":
    main()
