import { v4 as uuidv4 } from 'uuid';
import { Vec, StableBTreeMap, Opt, ic, Result } from 'azle';

/**
 * @name User
 * @author mlecoustre
 * @date 2024-03-02
 * @description It's user's account management providing basic functions as
 *  - Signup - Creation of new account
 *  - Signin - Load account datas
 *  - UpdateDatas - Update account datas
 *  - delete - Delete user's account
 *
 * Users are storable objects in {@Link StableBTreemap} being self-balancy that acts as durable data-storage.
 * {@Link StableBTreeMap} keeps data across canisters upgrades.
 *
 * Brakedown of the `StableBTreeMap(string, User)` datastructure:
 * - the key of the map is `userId`
 * - the value of this map is an user itself `User` than is related to a given key (`userId`)
 *
 * Constructor values:
 * 1) 0 - memory id to initialize the map
 *
 */
//---------------------------------------------------------------------------------------------------------------
/**
 * This class represents User record
 */
export class User {
    id:                     string;
    pseudo:                 string;
    userName:               string;
    avatarURL:              string;
    referralId:             Opt<string>;
    createdAt:              Date;
    updatedAt:              Date;
}
export class UserPayload {
    pseudo:                 string;
    userName:               string;
    avatarURL:              string;
    referralId:             Opt<string>;
}

export const usersStorage = StableBTreeMap<string, User>(0);

/**
 * @name getUsers
 * @return Vec<User>
 *     all current stored users
 */
export function getUsers(): Vec<User> {
    return usersStorage.values();
}

/**
 * @name getUser
 * @param id: string
 *  userId to find user we would get
 * @return result
 *  result: Result<User, string>
 *      OK  = user: User  ->  The user record matching id
 *      Err = err: string ->  Error message
 */
export function getUser(id: string): Result<User, string> {
    const user = usersStorage.get(id);
    if (user.Some) {
        return Result.Ok(user.Some);
    } else {
        return Result.Err(`cannot find user with id ${id}`);
    }
}

/**
 * @name addUser
 * @param payload: UserPayload
 * @return User
 *      User created if OK
 */
export function addUser(payload: UserPayload): User {
    const user: User = {
        id: uuidv4(),
        ...payload,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate()
    };
    usersStorage.insert(user.id, user);
    return user;
}

/**
 * @name updateUser
 * @param id
 *  id: string -> userId we would update
 * @param payload
 *  payload: UserPayload -> updated payload
 * @return result
 *  result: Result<User, string>
 *    user: User -> updated User
 *    err: string -> error message
 */
export function updateUser(id: string, payload: UserPayload): Result<User, string> {
    const user = usersStorage.get(id);
    if (user.Some) {
        const newUser: User = {
            ...user.Some,
            ...payload,
            updatedAt: getCurrentDate()
        };
        usersStorage.insert(newUser.id, newUser);
        return Result.Ok(newUser);
    }
    return Result.Err(`cannot find user with id ${id}`);
}

/**
 * @name removeUser
 * @param id
 *  id: string -> userId we would remove
 * @return result
 *  result: Result<User, string>
 *      user: User  -> removed user when OK
 *      err: string -> error message when NOk
 * @description Functionn definitively removes user record matching id from {@Link StableBTreeMap} durable storage
 */
export function removeUser(id: string): Result<User, string> {
    const user = usersStorage.remove(id);
    if (user.Some) {
        return Result.Ok(user.Some);
    }
    return Result.Err(`cannot find user with id ${id}`);
}

//****************************************************************************************************************


// Internal function to get current Date from Internet Computer
function getCurrentDate(): Date {
    const timestamp = new Number(ic.time());
    return new Date(timestamp.valueOf() / 1000_000);
}