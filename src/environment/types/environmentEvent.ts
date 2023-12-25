import {Actor} from "../actor.ts";
import {Vector3} from "@babylonjs/core";
import {EnvironmentElement} from "./environmentElement.ts";

export enum EnvironmentEventType {
    ADDED,
    ACTION,
    REMOVED,
    UPDATED,
    CUSTOM
}

export type EnvironmentEvent = {
    type: EnvironmentEventType;
    src?: Actor | EnvironmentElement;
    dst?: Actor | EnvironmentElement;
    position?: Vector3;
    direction?: Vector3;
    data?: any;
}