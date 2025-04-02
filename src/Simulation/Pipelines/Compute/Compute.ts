import SimulationData from "../../Data/SimulationData";
import BufferManager from "../Buffer/BufferManager";
import WebGPUManager from "../../../WebGPU/WebGPUManger";
import GridClear from "./Class/GridClear";
import P2GCompute from "./Class/P2GCompute";
import GridSolveCompute from "./Class/GridSolveCompute";
import G2PCompute from "./Class/G2PCompute";


class Compute {
    private p2GCompute: P2GCompute;
    private gridClearCompute: GridClear;
    private GridSolveCompute: GridSolveCompute;
    private G2PCompute: G2PCompute;

    constructor(webGPUManager: WebGPUManager, bufferManager: BufferManager, simulationData: SimulationData) {
        this.p2GCompute = new P2GCompute(webGPUManager, simulationData, bufferManager);
        this.gridClearCompute = new GridClear(webGPUManager, simulationData, bufferManager);
        this.GridSolveCompute = new GridSolveCompute(webGPUManager, simulationData, bufferManager);
        this.G2PCompute = new G2PCompute(webGPUManager, simulationData, bufferManager);
    }

    init() {
        //this.p2GCompute.init();
        // this.gridClearCompute.init();
        this.GridSolveCompute.init();
        this.G2PCompute.init();
    }

    update() {
        //this.gridClearCompute.update();
        //this.p2GCompute.update();
        this.GridSolveCompute.update();
        this.G2PCompute.update();
    }

}

export default Compute;