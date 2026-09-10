const {
    MAX_CHAT_MESSAGE_LENGTH,
    ChatServiceError,
    normalizeMessageContent,
    serializeChatMessage,
} = require('./chat/shared');
const {
    getBlockingRelationship,
    blockUser,
    unblockUser,
    getBlockedUsers,
} = require('./chat/blocking');
const {
    createRoomMessage,
    createDirectMessage,
    getRoomHistory,
    getDirectHistory,
    getDirectConversations,
    markDirectMessagesRead,
} = require('./chat/messages');
const {
    createGameInvitation,
    getPendingGameInvitations,
    getPendingGameInvitation,
    respondToGameInvitation,
} = require('./chat/gameInvitations');

module.exports = {
    MAX_CHAT_MESSAGE_LENGTH,
    ChatServiceError,
    normalizeMessageContent,
    serializeChatMessage,
    getBlockingRelationship,
    createRoomMessage,
    createDirectMessage,
    createGameInvitation,
    getPendingGameInvitations,
    getPendingGameInvitation,
    respondToGameInvitation,
    getRoomHistory,
    getDirectHistory,
    getDirectConversations,
    markDirectMessagesRead,
    blockUser,
    unblockUser,
    getBlockedUsers,
};
