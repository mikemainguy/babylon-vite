import {
    AbstractMesh,
    Color3,
    GroundMesh,
    Material,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsMaterialCombineMode,
    PhysicsMotionType,
    PhysicsShapeMesh,
    PhysicsShapeType,
    PointLight,
    Scene,
    StandardMaterial,
    Vector3
} from "@babylonjs/core";
import {CloudProceduralTexture} from "@babylonjs/procedural-textures";

export class EnvironmentBuilder {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public sphere(position: Vector3, radius: number, color: string): AbstractMesh {
        const sphere = MeshBuilder.CreateSphere("sphere", {diameter: radius * 2}, this.scene);
        sphere.position = position;
        sphere.material = this.createMaterial(color);
        const agg = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE,
            {restitution: .2, friction: .9, radius: radius, mass: 10}, this.scene);
        agg.shape.material.restitutionCombine = PhysicsMaterialCombineMode.MINIMUM;
        return sphere;
    }

    public plane(position: Vector3, width: number, height: number, color: string): AbstractMesh {
        const plane = MeshBuilder.CreatePlane("plane", {width: width, height: height}, this.scene);
        plane.position = position;
        plane.rotation.x = Math.PI / 2;
        plane.material = this.createMaterial(color);
        new PhysicsAggregate(plane, PhysicsShapeType.BOX, {mesh: plane, mass: 10}, this.scene);
        plane.physicsBody.setMotionType(PhysicsMotionType.STATIC);
        return plane;
    }

    public skybox(size: number, color: string): AbstractMesh {

        const skybox = MeshBuilder.CreateBox("skyBox", {size: size}, this.scene);
        const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        //skyboxMaterial.diffuseColor = Color3.FromHexString(color);
        const clouds = new CloudProceduralTexture("noise", 2048, this.scene);
        clouds.skyColor.set(.01, .01, .1, .8);
        clouds.cloudColor.set(.1, 0, .3, .9);
        clouds.amplitude = .2;
        skyboxMaterial.emissiveTexture = clouds;
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;
        return skybox;
    }

    public bullet(position: Vector3, width: number, color: string): AbstractMesh {
        const bulletMesh = MeshBuilder.CreateIcoSphere("bullet", {radius: width}, this.scene);
        const material = this.createMaterial(color) as StandardMaterial;
        material.ambientColor = Color3.FromHexString(color);
        material.emissiveColor = Color3.FromHexString("#ffffff");

        bulletMesh.material = material;

        bulletMesh.position = position;
        const light = new PointLight("light", Vector3.Zero(), this.scene);
        light.parent = bulletMesh;
        light.position = new Vector3(0, 0, 0);
        light.intensity = .02;
        new PhysicsAggregate(bulletMesh, PhysicsShapeType.SPHERE, {mesh: bulletMesh, mass: 10}, this.scene);
        bulletMesh.physicsBody.setMotionType(PhysicsMotionType.DYNAMIC);
        setTimeout(() => {
            bulletMesh.dispose();
            light.dispose();
        }, 2500);
        return bulletMesh;
    }

    public groundMap(position: Vector3, width: number, height: number): AbstractMesh {
        const ground = MeshBuilder.CreateGroundFromHeightMap("ground", "/textures/terrain1.jpg",
            {
                width: width, height: height, subdivisions: 128, maxHeight: 30,
                onReady: (mesh: GroundMesh) => {
                    const aggregate = new PhysicsAggregate(ground, new PhysicsShapeMesh(mesh, ground.getScene()), {
                        mesh: ground,
                        mass: 0,
                        restitution: 0
                    }, this.scene);
                    aggregate.body.setMotionType(PhysicsMotionType.STATIC);
                    aggregate.material.restitution = 1;
                }
            }, this.scene);
        ground.position = position;


        return ground;
    }

    public ground(position: Vector3, width: number, height: number, color: string): AbstractMesh {
        const plane = MeshBuilder.CreatePlane("plane", {width: width, height: height}, this.scene);
        plane.position = position;
        plane.rotation = new Vector3(Math.PI / 2, 0, 0);
        plane.material = this.createMaterial(color);
        const aggregate = new PhysicsAggregate(plane, PhysicsShapeType.BOX, {mesh: plane, mass: 0}, this.scene);
        aggregate.body.setMotionType(PhysicsMotionType.STATIC);
        return plane;
    }

    private createMaterial(color: string): Material {
        const material = new StandardMaterial("sphereMaterial", this.scene)
        material.diffuseColor = Color3.FromHexString(color);
        return material;
    }
}