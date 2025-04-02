class WebGPUManager {
    private engine: BABYLON.WebGPUEngine;
    private device: GPUDevice;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new BABYLON.WebGPUEngine(this.canvas, {
            setMaximumLimits: true,
            powerPreference: "high-performance"
        }
        );
        this.device = this.engine._device as GPUDevice;
    }

    async initWebGPUEngine(): Promise<void> {
        await this.engine.initAsync();
        this.device = this.engine._device as GPUDevice;
    }

    getEngine(): BABYLON.WebGPUEngine {
        return this.engine;
    }

    getDevice(): GPUDevice {
        return this.device;
    }

    getContext(): GPUCanvasContext {
        return this.canvas.getContext("webgpu") as GPUCanvasContext;
    }

}

export default WebGPUManager;