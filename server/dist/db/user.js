"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserWithDefaultDatapoints = createUserWithDefaultDatapoints;
const database_1 = __importDefault(require("./database"));
const datapointDefinitions_1 = require("../llm/datapointDefinitions");
async function createUserWithDefaultDatapoints(userData) {
    return database_1.default.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: userData,
        });
        const datapointsToCreate = [];
        for (const category in datapointDefinitions_1.masterDatapointDefinitions) {
            for (const name in datapointDefinitions_1.masterDatapointDefinitions[category]) {
                const definition = datapointDefinitions_1.masterDatapointDefinitions[category][name];
                datapointsToCreate.push({
                    userId: user.id,
                    category,
                    name,
                    label: definition.label,
                    type: definition.type,
                    min: definition.min,
                    max: definition.max,
                    step: definition.step,
                });
            }
        }
        await tx.userDatapoint.createMany({
            data: datapointsToCreate,
        });
        return user;
    });
}
