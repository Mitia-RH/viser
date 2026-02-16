"""Distance fog

Add distance-based fog to fade objects into a background color.

This example demonstrates :meth:`viser.SceneApi.configure_fog`, which applies
linear fog to the scene. Objects between ``near`` and ``far`` will gradually
blend into the fog color, giving a sense of depth.

The scene contains a grid, point clouds, Gaussian splats, and simple meshes so
you can observe how fog affects each type of geometry. GUI controls are provided
to adjust fog parameters at runtime.
"""

import time

import numpy as np

import viser


def main() -> None:
    server = viser.ViserServer()

    # -- Scene objects --------------------------------------------------------

    # Ground grid.
    server.scene.add_grid(
        "/grid",
        width=40.0,
        height=40.0,
        cell_size=1.0,
        position=(0.0, 0.0, -1.0),
    )

    # A row of boxes receding into the distance.
    for i in range(12):
        depth = 2.0 + i * 3.0
        server.scene.add_mesh_simple(
            f"/boxes/{i}",
            vertices=np.array(
                [
                    [-0.5, -0.5, -0.5],
                    [0.5, -0.5, -0.5],
                    [0.5, 0.5, -0.5],
                    [-0.5, 0.5, -0.5],
                    [-0.5, -0.5, 0.5],
                    [0.5, -0.5, 0.5],
                    [0.5, 0.5, 0.5],
                    [-0.5, 0.5, 0.5],
                ],
                dtype=np.float32,
            ),
            faces=np.array(
                [
                    [0, 1, 2],
                    [0, 2, 3],
                    [4, 6, 5],
                    [4, 7, 6],
                    [0, 4, 5],
                    [0, 5, 1],
                    [2, 6, 7],
                    [2, 7, 3],
                    [0, 7, 4],
                    [0, 3, 7],
                    [1, 5, 6],
                    [1, 6, 2],
                ],
                dtype=np.uint32,
            ),
            color=(60, 120, 200),
            position=(0.0, depth, 0.0),
        )

    # A spiral point cloud.
    num_points = 2000
    t = np.linspace(0, 20, num_points)
    positions = np.column_stack(
        [
            np.sin(t) * (1.0 + t / 15.0),
            t * 0.8,
            np.cos(t) * (1.0 + t / 15.0),
        ],
    ).astype(np.float32)
    colors = np.zeros((num_points, 3), dtype=np.uint8)
    norm = (t - t.min()) / (t.max() - t.min())
    colors[:, 0] = (norm * 255).astype(np.uint8)
    colors[:, 1] = ((1 - norm) * 180).astype(np.uint8)
    colors[:, 2] = 120

    server.scene.add_point_cloud(
        "/points",
        points=positions,
        colors=colors,
        point_size=0.06,
        position=(-8.0, 0.0, 0.0),
    )

    # Gaussian splats scattered into the distance.
    num_splats = 500
    rng = np.random.default_rng(0)
    splat_centers = np.column_stack(
        [
            rng.uniform(-4.0, 4.0, num_splats),
            rng.uniform(2.0, 35.0, num_splats),  # Spread along depth for fog.
            rng.uniform(-1.0, 2.0, num_splats),
        ],
    ).astype(np.float32)
    # Small isotropic covariances.
    scales = rng.uniform(0.05, 0.15, size=(num_splats, 3)).astype(np.float32)
    splat_covariances = np.zeros((num_splats, 3, 3), dtype=np.float32)
    for axis in range(3):
        splat_covariances[:, axis, axis] = scales[:, axis] ** 2
    splat_rgbs = rng.uniform(0.3, 1.0, size=(num_splats, 3)).astype(np.float32)
    splat_opacities = rng.uniform(0.6, 1.0, size=(num_splats, 1)).astype(np.float32)

    server.scene.add_gaussian_splats(
        "/splats",
        centers=splat_centers,
        covariances=splat_covariances,
        rgbs=splat_rgbs,
        opacities=splat_opacities,
        position=(8.0, 0.0, 0.0),
    )

    # -- Fog defaults ---------------------------------------------------------

    fog_near = 3.0
    fog_far = 20.0
    fog_color = (255, 255, 255)

    server.scene.configure_fog(fog_near, fog_far, color=fog_color)

    # -- GUI controls ---------------------------------------------------------

    with server.gui.add_folder("Fog"):
        gui_enabled = server.gui.add_checkbox("Enabled", initial_value=True)
        gui_near = server.gui.add_slider(
            "Near",
            min=0.0,
            max=50.0,
            step=0.5,
            initial_value=fog_near,
        )
        gui_far = server.gui.add_slider(
            "Far",
            min=1.0,
            max=50.0,
            step=0.5,
            initial_value=fog_far,
        )
        gui_color = server.gui.add_rgb("Color", initial_value=fog_color)

    def update_fog(_) -> None:
        server.scene.configure_fog(
            gui_near.value,
            gui_far.value,
            color=gui_color.value,
            enabled=gui_enabled.value,
        )

    gui_enabled.on_update(update_fog)
    gui_near.on_update(update_fog)
    gui_far.on_update(update_fog)
    gui_color.on_update(update_fog)

    while True:
        time.sleep(10.0)


if __name__ == "__main__":
    main()
