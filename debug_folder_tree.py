import viser
import traceback

def main():
    try:
        print("Creating server...")
        server = viser.ViserServer()
        print("Server created.")
        
        print("Creating folder tree...")
        folder_tree = server.gui.add_folder_tree(
            label="Test FolderTree",
            expand_by_default=True,
            visible=True,
            visibility_state=True
        )
        print("✅ FolderTree created successfully!")
        
        print("Creating button...")
        button = server.gui.add_button("Test Button")
        print("✅ Button created successfully!")
        
        print("Done! Server running...")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()
