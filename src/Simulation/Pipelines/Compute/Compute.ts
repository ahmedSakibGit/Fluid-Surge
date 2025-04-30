import SimulationData from "../../Data/SimulationData";
import BufferManager from "../Buffer/BufferManager";
import WebGPUManager from "../../../WebGPU/WebGPUManger";
import GridClear from "./Class/GridClear";
import P2GCompute from "./Class/P2GCompute";
import GridSolveCompute from "./Class/GridSolveCompute";
import G2PCompute from "./Class/G2PCompute";
import P2GSecondCompute from "./Class/P2GSecondCompute";
import ContainerManager from "../../../3D/Container/ContainerManager";
import NormalizeCompute from "./Class/NormalizeCompute";


class Compute {
    private p2GCompute: P2GCompute;
    private gridClearCompute: GridClear;
    private GridSolveCompute: GridSolveCompute;
    private G2PCompute: G2PCompute;
    private P2GSecondCompute: P2GSecondCompute;
    private bufferManager: BufferManager;
    private normalizeCompute: NormalizeCompute;
    private ran:number = 0;

    constructor(webGPUManager: WebGPUManager, bufferManager: BufferManager, simulationData: SimulationData) {
        this.p2GCompute = new P2GCompute(webGPUManager, simulationData, bufferManager);
        this.gridClearCompute = new GridClear(webGPUManager, simulationData, bufferManager);
        this.GridSolveCompute = new GridSolveCompute(webGPUManager, simulationData, bufferManager);
        this.G2PCompute = new G2PCompute(webGPUManager, simulationData, bufferManager);
        this.P2GSecondCompute = new P2GSecondCompute(webGPUManager, simulationData, bufferManager);
        this.normalizeCompute = new NormalizeCompute(webGPUManager, simulationData, bufferManager);
        this.bufferManager = bufferManager;
    }

    init(containerManager: ContainerManager) {
        this.gridClearCompute.init();
        this.p2GCompute.init();
        this.P2GSecondCompute.init();
        this.GridSolveCompute.init(containerManager);
        this.G2PCompute.init(containerManager);
    }

    async update() {
        //if (this.ran > 5) return;
        this.ran++;
        await this.gridClearCompute.update();
        await this.p2GCompute.update();
        await this.P2GSecondCompute.update();
        await this.GridSolveCompute.update();
        // this.GridSolveCompute.updateUniforms();
         await this.G2PCompute.update();
       // this.G2PCompute.updateUniforms();
        // const grid = this.bufferManager.getGridBuffer();
        // const gridRem = this.bufferManager.getGridRemainderBuffer();

        // const gridData = await grid.read(); // returns Uint32Array or ArrayBuffer
        // const remData = await gridRem.read(); // returns Uint32Array or ArrayBuffer
    
        // console.log(new Uint32Array(gridData.buffer));
        // console.log(new Uint32Array(remData.buffer)); // view as raw bits 

        // // //  // ✅ Now this prints correct float values (including negative ones)
        // // // // //this.GridSolveCompute.updateUniforms();
        

        // const debug = this.bufferManager.getDebugBuffer();
        // const debugData = await debug.read(); // returns Uint32Array or ArrayBuffer

        
        // console.log(new Float32Array(debugData.buffer));
        
        
         
    }

}

export default Compute;