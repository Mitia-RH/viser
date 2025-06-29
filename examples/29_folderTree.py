import viser
import time
import numpy as np

def main() -> None:
    server = viser.ViserServer()

    # Create main folder tree
    with server.gui.add_folder_tree(
        label="Main Folder Tree",
        expand_by_default=True,
        visible=True
    ) as main_folder:
        
        # Add some controls inside the main folder
        button1 = server.gui.add_button("Button 1")
        slider1 = server.gui.add_slider("Slider 1", min=0, max=100, step=1, initial_value=50)
        
        # Create a nested folder tree
        with server.gui.add_folder_tree(
            label="Nested Folder Tree",
            expand_by_default=False,
            visible=True
        ) as nested_folder:
            
            button2 = server.gui.add_button("Nested Button")
            checkbox1 = server.gui.add_checkbox("Nested Checkbox", initial_value=True)
            
            # Add another level of nesting
            with server.gui.add_folder_tree(
                label="Deep Nested Folder",
                expand_by_default=True,
                visible=True
            ) as deep_folder:
                
                color_picker = server.gui.add_rgb("Color", initial_value=(255, 0, 0))
                number_input = server.gui.add_number("Number", initial_value=42)
        
        # Add a regular folder for comparison
        with server.gui.add_folder(
            label="Regular Folder",
            expand_by_default=True
        ) as regular_folder:
            
            text_input = server.gui.add_text("Text Input", initial_value="Hello")
            vector_input = server.gui.add_vector3("Vector", initial_value=(1.0, 0.0, 0.0))

    # Add some scene objects for visual feedback
    server.scene.add_frame("/origin", axes_length=1.0)
    
    # Add a simple mesh
    vertices = np.array([
        [0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
    ])
    faces = np.array([[0, 1, 2]])
    
    server.scene.add_mesh_simple(
        "/triangle",
        vertices=vertices,
        faces=faces,
        color=(0.8, 0.2, 0.2)
    )
    while True:
        time.sleep(0.01)

if __name__ == "__main__":
    main()