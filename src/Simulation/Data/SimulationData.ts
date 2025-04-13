class SimulationData {
    private filled: number;
    private fluidCount: number;
    private fluidToGridRatio: number;
    private sdfTextureResolution: number;
    
    constructor({ filled, fluidCount, fluidToGridRatio, sdfTextureResolution }: { filled: number; fluidCount: number; fluidToGridRatio: number, sdfTextureResolution: number}) {
        this.filled = filled;
        this.fluidCount = fluidCount;
        this.fluidToGridRatio = fluidToGridRatio;
        this.sdfTextureResolution = sdfTextureResolution;

    }

    update({ filled, fluidCount}: { filled: number; fluidCount: number; buffer: GPUBuffer}): void {
        this.filled = filled;
        this.fluidCount = fluidCount;
    }

    getData() {
        return {
            filled: this.filled,
            fluidCount: this.fluidCount,
            fluidToGridRatio: this.fluidToGridRatio,
            sdfTextureResolution: this.sdfTextureResolution
        };
    }

    getFluidToGridRatio(): number {
        return this.fluidToGridRatio;
    }
    
    getFilled(): number {
        return this.filled;
    }

    getFluidCount(): number {
        return this.fluidCount;
    }

    getSDFTextureResolution(): number {
        return this.sdfTextureResolution;
    }


    getGridNodeCount(): number {
        return Math.ceil(this.fluidCount * this.fluidToGridRatio);
    }
}

export default SimulationData;