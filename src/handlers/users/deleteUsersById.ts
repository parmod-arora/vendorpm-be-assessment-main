import { APIGatewayEvent, Handler } from 'aws-lambda';
import { Logger } from 'winston';
import {
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import { User } from '../../entities/User';
import { toUserDto } from './userDto';
import { GetUserByIdInput, getUserByIdValidator } from './getUsersById';

/**
 * Gets a {@link User} by its id if it exists
 * @param input
 */
export async function deleteUserById(
  logger: Logger,
  input: GetUserByIdInput
): Promise<HandlerOutput> {
  const dataSource = await getDataSource();

  const userRepo = dataSource.getRepository(User);

  const user = await userRepo.findOneBy({ id: input.userId });

  if (!user) {
    logger.warn('User not found!', input);
    return jsonResp(404, { message: 'User not found!' });
  }

  userRepo.delete({ id: user.id });

  return jsonResp(200, toUserDto(user));
}

// We separate the serverless side from the logic side to allow for handlers to be tested without a http context
// the generateAPIGatewayEventHandler method will take a function and serverless-ify it for you
export const deleteUsersByIdHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler(
    'DELETE',
    deleteUserById,
    getUserByIdValidator
  );
