import * as BABYLON from "@babylonjs/core";
import "@webgpu/types";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
    }
  }
}

  

declare global {
  namespace BABYLON {
    export * from "@babylonjs/core";
  }

}

export {};
