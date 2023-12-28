import {
    Camera,
    FreeCamera,
    GUID,
    Mesh,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsMaterialCombineMode,
    PhysicsMotionType,
    PhysicsShapeType,
    Ray,
    Scene,
    TransformNode,
    Vector3
} from "@babylonjs/core";

import {ControllerEvent, ControllerEventType} from "../controllers/controllerEvent.ts";
import {BasicMovement} from "./basicMovement.ts";
import {EnvironmentBuilder} from "../envrionmentBuilder.ts";


export enum AvatarEventType {
    MOVED,
    ROTATED,
    COLLIDED
}

export type AvatarEvent = {
    type: AvatarEventType;
    avatar: ImmersiveActor;
}

export interface MovementHandler {
    move(velocity: Vector3, event: ControllerEvent): void;
}

export class ImmersiveActor {
    public readonly id: string;
    private camera: Camera;
    private transformNode: TransformNode;
    private physics: PhysicsAggregate | null = null;
    private readonly velocity: Vector3 = new Vector3(0, 0, 0);
    private builder: EnvironmentBuilder | null = null;
    private CAM_POS = new Vector3(0, 1.6, 0);
    private movementHandler: MovementHandler | null = null;
    private rightTrigger: boolean = false;

    constructor(scene: Scene, position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero()) {
        this.camera = new FreeCamera("avatar camera", Vector3.Zero(), scene);
        //this.transformNode = new TransformNode("universalAvatar", scene);
        this.transformNode = MeshBuilder.CreateCylinder("avatar", {diameter: 1, height: .1}, scene);
        this.transformNode.rotation = rotation;
        this.transformNode.position = position;

        this.camera.parent = this.transformNode;
        this.builder = new EnvironmentBuilder(scene);
        this.camera.position.set(this.CAM_POS.x, this.CAM_POS.y, this.CAM_POS.z);
        this.id = GUID.RandomId();

        scene.onActiveCameraChanged.add(() => {
            if (scene.activeCamera) {
                this.camera = scene.activeCamera;
                this.camera.parent = this.transformNode;
                this.camera.position.set(this.CAM_POS.x, this.CAM_POS.y, this.CAM_POS.z);
            }
            if (this.physics) {
                this.movementHandler = new BasicMovement(this.physics, scene.activeCamera as Camera);
            }


        });

    }

    public enablePhysics(gravityFactor: number = 0) {
        this.physics = new PhysicsAggregate((this.transformNode as Mesh), PhysicsShapeType.MESH, {
                mesh: (this.transformNode as Mesh),
                mass: 100,
                restitution: 0,
            },
            this.transformNode.getScene());
        this.physics.body.setMassProperties({mass: 100, inertia: new Vector3(0, 0, 0)});
        this.physics.body.setGravityFactor(3);
        this.physics.body.setAngularDamping(.9);
        this.physics.body.setLinearDamping(.4);
        this.physics.material.friction = .1;
        this.physics.body.setMotionType(PhysicsMotionType.DYNAMIC);
        this.physics.body.setCollisionCallbackEnabled(true);
        this.physics.material.restitutionCombine = PhysicsMaterialCombineMode.MINIMUM;
        this.physics.transformNode.getScene().onAfterPhysicsObservable.add(() => {
            if (this.physics && this.physics.body && this.transformNode.physicsBody) {
                //this.transformNode.physicsBody.setAngularVelocity(Vector3.Zero());
                //this.physics.body.setAngularVelocity(Vector3.Zero());
                this.physics.body.disablePreStep = false;
                const y = this.transformNode.absoluteRotationQuaternion.toEulerAngles().y;
                //this.transformNode.rotation.x = 0;
                //this.transformNode.rotation.z = 0;
                this.physics.body.disablePreStep = true;
            }
        });

    }

    public controllerObserver(event: ControllerEvent) {
        if (this.movementHandler) {
            this.movementHandler.move(this.velocity, event);
        }
        if (event.type === ControllerEventType.R_TRIGGER) {
            if (typeof event.value != 'number') return;
            if (event.value > .5) {
                if (this.rightTrigger) return;
                this.rightTrigger = true;
                if (this.builder && event.controller.grip) {
                    const bullet = this.builder.bullet(
                        event.controller.grip.absolutePosition.clone(), .05, "#ffff00");
                    if (bullet.physicsBody) {
                        const ray = new Ray(Vector3.Zero(), Vector3.Zero());
                        event.controller.getWorldPointerRayToRef(ray)
                        //(bullet.material as StandardMaterial).emissiveColor = new Color3(1,1,1);
                        bullet.physicsBody.setLinearVelocity(ray.direction.scale(150));
                    }

                }
            }
            if (event.value == 0) {
                this.rightTrigger = false;
            }
        }
    }
}

