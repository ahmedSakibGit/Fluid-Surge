class CameraManager {
    private camera: BABYLON.FreeCamera;
    private canvas: HTMLCanvasElement;
    private scene: BABYLON.Scene;

    constructor(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.scene = scene;
        this.camera = this.getCamera();
    }

    init(): BABYLON.FreeCamera {
        const camera = new BABYLON.FreeCamera(
            "Camera",
            new BABYLON.Vector3(0, 5, -10), // Position the camera in front of the cube
            this.scene
        );
        camera.minZ = 0.001;
        camera.maxZ = 1000;
        camera.fov = Math.PI / 3;
        camera.setTarget(BABYLON.Vector3.Zero()); // Look at the origin
        camera.attachControl(this.canvas, true);

        // Enable movement controls (WASD + arrow keys)
        camera.keysUp.push(87);    // W
        camera.keysDown.push(83);  // S
        camera.keysLeft.push(65);  // A
        camera.keysRight.push(68); // D

        return camera;
    }

    public getCamera(): BABYLON.FreeCamera {
        let camera;
        if (!this.camera) {
            camera = this.init();
        }

        return this.camera ?? camera;
    }

    public getViewProjectionMatrix(): BABYLON.Matrix {
        const viewMatrix = this.camera.getViewMatrix();
        const projectionMatrix = this.camera.getProjectionMatrix();
        return projectionMatrix.multiply(viewMatrix); // Use original matrix
    }
}

export default CameraManager;
