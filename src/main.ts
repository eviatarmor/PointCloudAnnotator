import * as THREE from "../public/libs/three.js/build/three.module.js";
import {annotationService} from "./service.ts";
import {showErrorSnackbar} from "./components/snackbar/snackbar.ts";
import {showOrgConfirmDialog} from "./components/dialog/confirm-dialog.ts";
import {showOrgLabelDialog} from "./components/dialog/label-dialog.ts";

/**
 * Triggers a Potree-themed confirmation dialog specifically for deleting annotations.
 * @param label - The title of the annotation to be deleted.
 * @param onSuccess - Callback function executed when the user confirms deletion.
 */
function showDeleteConfirm(label: string, onSuccess: () => void) {
    showOrgConfirmDialog({
        title: "Delete Annotation?",
        message: `Annotation "${label}" will be permanently deleted. Are you sure?`,
        confirmText: "Delete",
        onConfirm: onSuccess
    });
}

/**
 * Opens the custom label input dialog.
 * Defaults to "Roarr" as the initial value unless modified.
 * @param label - The title displayed at the top of the dialog.
 * @param onSuccess - Returns the user-inputted string upon confirmation.
 * @param isEdit - Changes title to 'Edit Annotation'
 */
function showLabelDialog(label: string, onSuccess: (text: string) => void, isEdit: boolean = false) {
    showOrgLabelDialog({
        title: isEdit ? "Edit Annotation" : "New Annotation",
        labelText: "Annotation Name",
        initialValue: label,
        onConfirm: onSuccess
    })
}

/**
 * Initialises the main Potree Viewer instance and applies fundamental
 * 3D rendering settings (Eye Dome Lighting, Field of View, and Point Budget).
 * @param renderArea - The HTML container element for the viewer.
 * @returns The initialized Potree Viewer object.
 */
function configureViewer(renderArea: HTMLElement): any {
    const viewer = new Potree.Viewer(renderArea);
    window.viewer = viewer;

    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(1_000_000);
    viewer.loadSettingsFromURL();
    viewer.setBackground("skybox");

    return viewer;
}

/**
 * Loads the standard Potree Sidebar/GUI and sets the default localisation.
 * @param viewer - The active Potree Viewer instance.
 */
function configureGUI(viewer: any): void {
    viewer.loadGUI(() => {
        viewer.setLanguage('en');
        $("#menu_appearance").next().show();
    });
}

/**
 * Prepares the internal scene graph for the viewer.
 * @param viewer - The active Potree Viewer instance.
 */
function prepareScene(viewer: any): void {
    let sceneSG = new Potree.Scene();
    viewer.setScene(sceneSG);
}

/**
 * Loads a specific Point Cloud file into the scene
 * and positions the camera to a predefined viewpoint.
 * @param viewer - The active Potree Viewer instance.
 */
function loadPointCloud(viewer: any): void {
    // Lion Point Cloud
    Potree.loadPointCloud("/pointclouds/lion_takanawa/cloud.js", "lion", (e: any) => {
        viewer.scene.addPointCloud(e.pointcloud);
        viewer.scene.view.position.set(4.15, -6.12, 8.54);
        viewer.scene.view.lookAt(new THREE.Vector3(0, -0.098, 4.23));
        e.pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;

        viewer.fitToScreen();
    });
}

/**
 * Calculates a 3D coordinate based on a 2D mouse click using Potree's input handler.
 * @param renderArea - The viewer's container element.
 * @param viewer - The active Potree Viewer instance.
 * @param event - The native mouse event containing coordinates.
 * @returns An intersection object containing the 3D location, or null if no point was hit.
 */
function raytracePoint(renderArea: HTMLElement, viewer: any, event: MouseEvent) {
    const rect = renderArea.getBoundingClientRect();
    const mouse = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    return viewer.inputHandler.getMousePointCloudIntersection(mouse);
}

/**
 * Creates an annotation in the 3D viewer.
 * Includes hover animations and action button bindings (Edit/Delete).
 * @param viewer - The active Potree Viewer instance.
 * @param title - The text label for the annotation.
 * @param x, y, z - The 3D coordinates for placement.
 */
function addViewerAnnotation(viewer: any, title: string, x: number, y: number, z: number) {
    const anno = viewer.scene.addAnnotation([x, y, z], {
        "title": title,
        "actions": [
            // Edit action
            {
                "icon": "edit-3-svgrepo-com.svg",
                "tooltip": "Edit Title",
                "onclick": async () => {
                    showLabelDialog(title, async (updatedTitle: string) => {
                        try {
                            await annotationService.removeAnnotation(anno.title);
                            await annotationService.addAnnotation({
                                x, y, z,
                                label: updatedTitle
                            });

                            anno.title = updatedTitle;
                            anno.domElement.find('.annotation-title').text(updatedTitle);
                        } catch (error) {
                            showErrorSnackbar(error);
                        }
                    }, true);
                }
            },
            // Remove action
            {
                "icon": Potree.resourcePath + "/icons/remove.svg",
                "onclick": async () => {
                    showDeleteConfirm(anno.title, async () => {
                        try {
                            await annotationService.removeAnnotation(anno.title);
                            viewer.scene.removeAnnotation(anno);
                        } catch (error) {
                            showErrorSnackbar(error);
                        }
                    });
                }
            }
        ]
    });

    // // Select all action icon elements (Edit/Delete) within anno
    const actions = anno.domElement.find('.annotation-action-icon');

    // Invert the first icon (Edit) to ensure visibility against the dark theme
    if (actions[0]) {
        actions[0].style.filter = "invert(100%)";
    }

    // Hide action icons by default
    actions.css({
        "opacity": "0",
        "width": "0",
        "overflow": "hidden",
        "transition": "all 0.2s ease"
    });

    // Expand and reveal icons when the user hovers over the annotation
    anno.domElement.on('mouseenter', () => {
        actions.css({
            "opacity": "1",
            "width": "30px"
        });
    });

    // Collapse and hide icons when the mouse leaves the annotation area
    anno.domElement.on('mouseleave', () => {
        actions.css({
            "opacity": "0",
            "width": "0"
        });
    });
}

/**
 * Creates an annotation in both the persistent backend and the 3D viewer.
 * Includes hover animations and action button bindings (Edit/Delete).
 * @param viewer - The active Potree Viewer instance.
 * @param title - The text label for the annotation.
 * @param x, y, z - The 3D coordinates for placement.
 */
async function addAnnotation(viewer: any, title: string, x: number, y: number, z: number) {
    try {
        await annotationService.addAnnotation({
            x, y, z,
            label: title
        });

        addViewerAnnotation(viewer, title, x, y, z);
    } catch (error) {
        showErrorSnackbar(error);
    }
}

/**
 * Sets up the event listener for capturing 3D points via middle-click.
 * @param renderArea - The viewer's container element.
 * @param viewer - The active Potree Viewer instance.
 */
function configureClickableView(renderArea: HTMLElement, viewer: any) {
    const handleAction = (clientX: number, clientY: number) => {
        const point = raytracePoint(renderArea, viewer, {clientX, clientY} as MouseEvent);
        if (point) {
            showLabelDialog("Roarr", async (newTitle) => {
                await addAnnotation(viewer, newTitle, point.location.x, point.location.y, point.location.z);
            });
        }
    }

    renderArea.addEventListener("mousedown", async (event) => {
        const MIDDLE_BUTTON = 4;
        if (event.buttons === MIDDLE_BUTTON) {
            handleAction(event.clientX, event.clientY);
        }
    });

    // Mobile support
    renderArea.addEventListener("touchstart", async (event) => {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            handleAction(touch.clientX, touch.clientY);
        }
    });
}

/**
 * Retrieves all saved annotations from the annotationService and
 * renders them into the 3D scene upon startup.
 * @param viewer - The active Potree Viewer instance.
 */
async function loadAnnotations(viewer: any) {
    try {
        const annotations = await annotationService.getAllAnnotations();
        for (const data of annotations) {
            addViewerAnnotation(viewer, data.label, data.x, data.y, data.z);
        }
    } catch (error) {
        showErrorSnackbar(error);
    }
}

/**
 * Begins the entire initialisation sequence:
 * Setup viewer -> Handle clicks -> Prepare scene -> Load data.
 */
function initViewer() {
    const renderArea = document.getElementById("potree_render_area");
    if (!renderArea) return;

    const viewer = configureViewer(renderArea);
    configureClickableView(renderArea, viewer);

    // If you want to see the GUI uncomment this
    // configureGUI(viewer);

    prepareScene(viewer);
    loadPointCloud(viewer);
    loadAnnotations(viewer);
}

// Start initialisation
initViewer();
