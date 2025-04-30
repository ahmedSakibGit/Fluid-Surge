# FluidSurge 🧪⚡

**Real-time GPU-Driven Fluid Simulation in WebGPU**

FluidSurge is a high-performance real-time fluid simulation framework built from the ground up using **WebGPU**, **WGSL compute shaders**, and **Babylon.js**. It demonstrates advanced GPU compute pipelines, rendering systems, and particle-based fluid physics — all running **entirely on the GPU** with zero CPU bottlenecks.

<img width="1281" alt="image" src="https://github.com/user-attachments/assets/fc5927e7-e61e-407c-82ec-353890766113" />


---

## 🚀 Features

- 🔧 **Multi-Pass Compute Shaders**  
  Implements an **MLS-MPM–inspired pipeline**, with multi-stage particle updates for mass, velocity, and pressure — optimized with `float4`-aligned GPU buffers.

- 🧠 **Atomic Operation Workaround (AtomicF32)**  
  WebGPU lacks atomic operations on floats — solved using a **custom fixed-point encoding system** using dual `u32` registers to simulate `f32` accumulation atomically.

- 🌀 **SSFR Rendering (Screen Space Fluid Rendering)**  
  Fluid particles are rendered using **GPU-generated quads** with a custom ShaderMaterial in Babylon.js, designed for high-quality screen-aligned fluid appearance.

- 📦 **GPU-Only Data Flow**  
  Entire physics and rendering data loop remains **on the GPU** — compute shader output is passed directly into the rendering stage with **no CPU-GPU sync overhead**.

- ⚙️ **Spatial Workgroup Optimization**  
  Dynamic dispatch of compute workgroups based on local turbulence — using intensity metrics to scale GPU load intelligently.

---

## 🧱 Architecture

```text
          ┌──────────────────┐
          │ Initial Particle │
          │ Distribution     │
          └──────┬───────────┘
                 ▼
        ┌──────────────────┐
        │ Compute Shader 1 │  ← Mass / Velocity encoding
        └──────┬───────────┘
                 ▼
        ┌──────────────────┐
        │ Compute Shader 2 │  ← Forces, Position Update
        └──────┬───────────┘
                 ▼
        ┌──────────────────┐
        │ ShaderMaterial   │  ← Screen-aligned quads
        │ Renderer (SSFR)  │
        └──────────────────┘
