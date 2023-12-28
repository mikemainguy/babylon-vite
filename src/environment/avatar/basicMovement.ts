import {Camera, PhysicsAggregate, Vector3} from "@babylonjs/core";
import {ControllerEvent, ControllerEventType} from "../controllers/controllerEvent.ts";

export class BasicMovement {
    public speedFactor: number = 10;
    protected physics: PhysicsAggregate;
    protected camera: Camera;

    constructor(physics: PhysicsAggregate, camera: Camera) {
        this.physics = physics;
        this.camera = camera;
    }

    public move(velocity: Vector3, event: ControllerEvent) {
        if (!this.physics || !event.type || !event.value || typeof event.value === 'number') {
            return;
        }
        const face = this.camera.absoluteRotation;
        const v = velocity.applyRotationQuaternion(face);

        switch (event.type) {
            case ControllerEventType.L_STICK:
                velocity.z = this.computeValue(event.value.y, -250);
                velocity.x = this.computeValue(event.value.x, 250);
                break;
            case ControllerEventType.R_STICK:
                //velocity.y = this.computeValue(event.value.y, -1);
                this.physics.body.setAngularVelocity(new Vector3(0, this.computeValue(event.value.x, .2), 0));
                break;
        }
        v.y = 0;
        this.physics.body.applyForce(v, this.physics.body.transformNode.absolutePosition);
    }

    protected computeValue(value, sign): number {
        if (Math.abs(value) < .25) {
            return 0;
        } else {
            return value * this.speedFactor * sign;
        }
    }
}