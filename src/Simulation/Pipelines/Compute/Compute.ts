import SimulationData from "../../Data/SimulationData";
import BufferManager from "../Buffer/BufferManager";
import WebGPUManager from "../../../WebGPU/WebGPUManger";
import GridClear from "./Class/GridClear";
import P2GCompute from "./Class/P2GCompute";
import GridSolveCompute from "./Class/GridSolveCompute";
import G2PCompute from "./Class/G2PCompute";
import P2GSecondCompute from "./Class/P2GSecondCompute";
import ContainerManager from "../../../3D/Container/ContainerManager";


class Compute {
    private p2GCompute: P2GCompute;
    private gridClearCompute: GridClear;
    private GridSolveCompute: GridSolveCompute;
    private G2PCompute: G2PCompute;
    private P2GSecondCompute: P2GSecondCompute;
    

    constructor(webGPUManager: WebGPUManager, bufferManager: BufferManager, simulationData: SimulationData) {
        this.p2GCompute = new P2GCompute(webGPUManager, simulationData, bufferManager);
        this.gridClearCompute = new GridClear(webGPUManager, simulationData, bufferManager);
        this.GridSolveCompute = new GridSolveCompute(webGPUManager, simulationData, bufferManager);
        this.G2PCompute = new G2PCompute(webGPUManager, simulationData, bufferManager);
        this.P2GSecondCompute = new P2GSecondCompute(webGPUManager, simulationData, bufferManager);
    }

    init(containerManager: ContainerManager) {
        this.gridClearCompute.init();
        this.p2GCompute.init();
        this.P2GSecondCompute.init();
        this.GridSolveCompute.init(containerManager);
        this.G2PCompute.init(containerManager);
    }

    update() {
        this.gridClearCompute.update();
        this.p2GCompute.update();
        this.P2GSecondCompute.update();
        this.GridSolveCompute.updateUniforms();
        this.GridSolveCompute.update();
        this.G2PCompute.updateUniforms();
        this.G2PCompute.update();
    }

}

export default Compute;