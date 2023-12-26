import {
    Camera,
    FreeCamera,
    GUID,
    PhysicsAggregate,
    PhysicsMotionType,
    PhysicsShapeType,
    Scene,
    TransformNode,
    Vector3
} from "@babylonjs/core";

import {ControllerEvent, ControllerEventType} from "../controllers/controllerEvent.ts";

export enum AvatarEventType {
    MOVED,
    ROTATED,
    COLLIDED
}

export type AvatarEvent = {
    type: AvatarEventType;
    avatar: UniversalAvatar;
}

export class UniversalAvatar {
    public readonly id: string;
    private camera: Camera;
    private transformNode: TransformNode;
    private physics: PhysicsAggregate;
    private readonly velocity: Vector3 = new Vector3(0, 0, 0);
    private readonly rotation: Vector3 = new Vector3(0, 0, 0);

    constructor(scene: Scene, position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero()) {
        this.camera = new FreeCamera("avatar camera", new Vector3(0, 1.6, 0), scene);

        this.transformNode = new TransformNode("universalAvatar", scene);
        this.transformNode.position = position;
        this.camera.parent = this.transformNode;
        this.id = GUID.RandomId();
        scene.onActiveCameraChanged.add(() => {
            if (scene.activeCamera) {
                this.camera = scene.activeCamera;
                this.camera.parent = this.transformNode;
                this.camera.position = new Vector3(0, 1.6, 0);
            }
        });
    }

    public enablePhysics() {
        this.physics = new PhysicsAggregate(this.transformNode, PhysicsShapeType.CYLINDER, {
                radius: .5,
                pointA: Vector3.Up().scale(1.6),
                pointB: Vector3.Zero(),
                mass: 100
            },
            this.transformNode.getScene());
        this.physics.body.setGravityFactor(0);
        this.physics.body.setMotionType(PhysicsMotionType.DYNAMIC);
    }

    public controllerObserver(event: ControllerEvent) {
        if (!this.physics) {
            return;
        }
        const face = this.camera.absoluteRotation;
        const v = this.velocity.applyRotationQuaternion(face);
        switch (event.type) {
            case ControllerEventType.L_STICK:
                if (event.value && typeof event.value != 'number') {
                    this.velocity.z = computeValue(event.value.y, -1);
                    this.velocity.x = computeValue(event.value.x, 1);
                }
                this.physics.body.setLinearVelocity(v);
                break;
            case ControllerEventType.R_STICK:
                if (event.value && typeof event.value != 'number') {
                    this.velocity.y = computeValue(event.value.y, -1);
                }
                this.physics.body.setLinearVelocity(v);
                break;
        }
    }
}

function computeValue(value, sign): number {
    if (Math.abs(value) < .2) {
        return 0;
    } else {
        return value * 10 * sign;
    }
}