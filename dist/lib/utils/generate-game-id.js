import { v4 as uuid } from 'uuid';
export const isValidId = (id) => {
    return /^[A-Z0-9]{6}$/.test(id);
};
export const generateGameId = (gameRooms) => {
    let newId;
    const generateRandomId = () => {
        return uuid().substring(0, 6).toUpperCase();
    };
    do {
        newId = generateRandomId();
    } while (gameRooms.has(newId) || !isValidId(newId));
    return newId;
};
