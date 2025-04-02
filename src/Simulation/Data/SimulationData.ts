class SimulationData {
    private filled: number;
    private fluidCount: number;
    private buffer: GPUBuffer | null;
    private fluidToGridRatio: number;
    
    constructor({ filled, fluidCount, buffer, fluidToGridRatio }: { filled: number; fluidCount: number; buffer: GPUBuffer | null; fluidToGridRatio: number}) {
        this.filled = filled;
        this.fluidCount = fluidCount;
        this.buffer = buffer;
        this.fluidToGridRatio = fluidToGridRatio;

    }

    update({ filled, fluidCount, buffer }: { filled: number; fluidCount: number; buffer: GPUBuffer}): void {
        this.filled = filled;
        this.fluidCount = fluidCount;
        this.buffer = buffer;
    }

    getData() {
        return {
            filled: this.filled,
            fluidCount: this.fluidCount,
            buffer: this.buffer,
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

    getBuffer(): GPUBuffer | null {
        return this.buffer;
    }

    setBuffer(buffer: GPUBuffer): void {
        this.buffer = buffer;
    }

    getGridNodeCount(): number {
        return Math.ceil(this.fluidCount * this.fluidToGridRatio);
    }
}

export default SimulationData;