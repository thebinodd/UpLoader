
const generateUUID = () => {
    const uuid = (Math.random().toString(36).substring(2, 6) + "-" + Math.random().toString(36).substring(2, 6)).toUpperCase();
    return uuid

}
export default generateUUID;