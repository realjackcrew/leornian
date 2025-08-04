import prisma from './database';
import { masterDatapointDefinitions } from '../llm/datapointDefinitions';
import { User } from '@prisma/client';

export async function createUserWithDefaultDatapoints(userData: Omit<User, 'id' | 'whoopAccessToken' | 'whoopRefreshToken' | 'whoopTokenExpiresAt' | 'whoopUserId' | 'settings' >): Promise<User> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: userData,
    });

    const datapointsToCreate = [];
    for (const category in masterDatapointDefinitions) {
      for (const name in masterDatapointDefinitions[category]) {
        const definition = masterDatapointDefinitions[category][name];
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
