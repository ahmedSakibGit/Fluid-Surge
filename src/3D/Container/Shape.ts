class Shape {
  protected mesh: BABYLON.Mesh;

  constructor(name: string, scene: BABYLON.Scene) {
    this.mesh = new BABYLON.Mesh(name, scene);
  }

  getMesh() {
    return this.mesh;
  }
}

export default Shape;