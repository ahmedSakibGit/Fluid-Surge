export type WorkgroupSizeResult = {
    x: number;
    y: number;
    z: number;
    sacrifice: "none" | "z" | "y" | "x" | "none found";
};

function getPowerOfTwoFactors(max: number, min: number): number[] {
    const factors: number[] = [];
    for (let i = 1; i <= max; i *= 2) {
        if (i >= min) factors.push(i);
    }
    return factors.reverse();
}

export function calculateBestWorkgroupSize(
    device: GPUDevice,
    maxInvocations: number,
    bytesPerThreadShared: number
): WorkgroupSizeResult {
    const maxX = device.limits.maxComputeWorkgroupSizeX;
    const maxY = device.limits.maxComputeWorkgroupSizeY;
    const maxZ = device.limits.maxComputeWorkgroupSizeZ;
    const maxShared = device.limits.maxComputeWorkgroupStorageSize;
    const minX = (device.limits as any).minComputeWorkgroupSizeX ?? 1;
    const minY = (device.limits as any).minComputeWorkgroupSizeY ?? 1;
    const minZ = (device.limits as any).minComputeWorkgroupSizeZ ?? 1;

    const powersX = getPowerOfTwoFactors(maxX, minX);
    const powersY = getPowerOfTwoFactors(maxY, minY);
    const powersZ = getPowerOfTwoFactors(maxZ, minZ);

    let best: WorkgroupSizeResult = { x: minX, y: minY, z: minZ, sacrifice: "none found" };
    let bestDiff = Number.MAX_SAFE_INTEGER;

    for (const x of powersX) {
        for (const y of powersY) {
            for (const z of powersZ) {
                const totalThreads = x * y * z;
                if (totalThreads <= maxInvocations && (totalThreads * bytesPerThreadShared <= maxShared)) {
                    const maxDim = Math.max(x, y, z);
                    const minDim = Math.min(x, y, z);
                    const midDim = x + y + z - maxDim - minDim;
                    const balance = (maxDim - midDim) + (midDim - minDim);
                    const penalty = 1024 - totalThreads; 
                    const diff = balance * 10 + penalty;

                    if (diff < bestDiff) {
                        best = { x, y, z, sacrifice: "none" };
                        bestDiff = diff;
                    }
                }
            }
        }
    }

    return best;
}

export type DispatchAndWorkgroup = {
    dispatch: { x: number; y: number; z: number };
    workgroupSize: { k: number; l: number; m: number };
};

export function getSpatialDispatchAndWorkgroupDimension(
    device: GPUDevice,
    particleCount: number,
    bytesPerThreadShared: number
): DispatchAndWorkgroup {
    const maxInvocations = device.limits.maxComputeInvocationsPerWorkgroup;
    const maxDispatch = device.limits.maxComputeWorkgroupsPerDimension;
    const { x: k, y: l, z: m } = calculateBestWorkgroupSize(device, maxInvocations, bytesPerThreadShared);

    const threadsPerGroup = k * l * m;
    const totalWorkgroups = Math.ceil(particleCount / threadsPerGroup);

    let bestX = 1, bestY = 1, bestZ = totalWorkgroups;
    let minDiff = Number.MAX_SAFE_INTEGER;

    const upperBound = Math.min(maxDispatch, Math.ceil(Math.cbrt(totalWorkgroups)) * 2);

    for (let x = 1; x <= upperBound; x++) {
        for (let y = 1; y <= upperBound; y++) {
            const z = Math.ceil(totalWorkgroups / (x * y));
            if (z <= maxDispatch) {
                const diff = Math.abs(x - y) + Math.abs(y - z) + Math.abs(z - x);
                if (diff < minDiff) {
                    bestX = x;
                    bestY = y;
                    bestZ = z;
                    minDiff = diff;
                }
            }
        }
    }

    return {
        dispatch: { x: bestX, y: bestY, z: bestZ },
        workgroupSize: { k, l, m }
    };
}

export function getSpatialDispatchDimensionAndShader(
    device: GPUDevice,
    particleCount: number,
    bytesPerThreadShared: number,
    shader: string
): { shader: string; dispatch: { x: number; y: number; z: number }, workgroupSize: { k: number; l: number; m: number } } {
    const { dispatch, workgroupSize } = getSpatialDispatchAndWorkgroupDimension(device, particleCount, bytesPerThreadShared);

    const { k, l, m } = workgroupSize;

    const updatedShader = shader
        .replace(/@workgroup_size\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/, `@workgroup_size(${k}, ${l}, ${m})`)
        .replace(/@workgroup_size\(k,\s*l,\s*m\)/, `@workgroup_size(${k}, ${l}, ${m})`);

    return {
        shader: updatedShader,
        dispatch,
        workgroupSize
    };
}