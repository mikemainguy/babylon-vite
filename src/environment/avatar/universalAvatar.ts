import {
    Camera,
    FreeCamera,
    GUID,
    PhysicsAggregate,
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
    private readonly camera: Camera;
    private transformNode: TransformNode;
    private physics: PhysicsAggregate;

    constructor(scene: Scene, position: Vector3 = Vector3.Zero(), rotation: Vector3 = Vector3.Zero()) {
        this.camera = new FreeCamera("avatar camera", position, scene);
        this.transformNode = new TransformNode("universalAvatar", scene);
        this.camera.parent = this.transformNode;
        this.id = GUID.RandomId();
    }

    public enablePhysics() {
        this.physics = new PhysicsAggregate(this.transformNode, PhysicsShapeType.CYLINDER, {
                radius: 2,
                pointA: Vector3.Zero(),
                pointB: Vector3.Up(), mass: 10
            },
            this.transformNode.getScene());
        this.physics.body.setGravityFactor(1);
    }

    public controllerObserver(event: ControllerEvent) {
        switch (event.type) {
            case ControllerEventType.L_STICK:
                break;
            case ControllerEventType.R_STICK:
                break;
        }
    }
}
