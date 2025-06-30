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
    
    with folder_tree:
        with server.gui.add_folder_tree(
            label="Subfolder 1",
            expand_by_default=True,
            visible=True,
            visibility_state=True
        ):
            button = server.gui.add_button("Test Button")
    
    try:
        while True:
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("Server stopped.")

if __name__ == "__main__":
    main()
