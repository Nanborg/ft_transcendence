import { useEffect, useMemo, useState } from 'react';
import { ChatPanel } from './ChatPanel';
import { DirectChatPanel } from './DirectChatPanel';
import { InvitationPanel } from './InvitationPanel';

export function GlobalChatDock({
    currentUser,
    currentRoom,
    roomChat,
    directChat,
    onInputFocusChange,
    keyboardShortcutEnabled = false,
})
{
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(currentRoom?.id ? 'room' : 'private');
    const [seenRoomMessageCount, setSeenRoomMessageCount] = useState(roomChat.liveMessageCount);
    const directUnreadCount = useMemo(
        () => directChat.conversations.reduce(
            (total, conversation) =>
                total + (Number(conversation.unreadCount) || 0),
            0
        ),
        [directChat.conversations]
    );
    const pendingReceivedInvitationCount = directChat.invitations.filter(message =>
        Number(message.recipient?.id) === Number(currentUser?.id) &&
        message.invitation?.status === 'PENDING'
    ).length;
    const invitationCount = pendingReceivedInvitationCount + directChat.unreadInvitationResponseCount;
    const roomUnreadCount = Math.max(
        0,
        roomChat.liveMessageCount - seenRoomMessageCount
    );
    const totalUnreadCount = roomUnreadCount + directUnreadCount + invitationCount;

    useEffect(() => {
        if (!currentRoom?.id)
            setActiveTab('private');

        setSeenRoomMessageCount(roomChat.liveMessageCount);
    }, [currentRoom?.id, roomChat.liveMessageCount]);

    useEffect(() => {
        if (!directChat.openRequestId)
            return;

        setActiveTab('private');
        setIsOpen(true);
    }, [directChat.openRequestId]);

    useEffect(() => {
        if (isOpen && activeTab === 'room' && currentRoom?.id)
            setSeenRoomMessageCount(roomChat.liveMessageCount);
    }, [isOpen, activeTab, currentRoom?.id, roomChat.liveMessageCount, ]);

    useEffect(() => {
        if (!keyboardShortcutEnabled)
            return undefined;
        function handleChatShortcut(event)
        {
            const target = event.target;
            const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
            if (event.key === 'Enter' && !isOpen && !isTyping)
            {
                event.preventDefault();
                directChat.refreshDirectOverview();
                setActiveTab(currentRoom?.id ? 'room' : 'private');
                setIsOpen(true);
                return;
            }
            if (event.key === 'Escape' && isOpen)
            {
                event.preventDefault();
                onInputFocusChange?.(false);
                setIsOpen(false);
            }
        }
        window.addEventListener('keydown', handleChatShortcut);
        return () => {
            window.removeEventListener('keydown', handleChatShortcut);
        };
    }, [keyboardShortcutEnabled, isOpen, currentRoom?.id, onInputFocusChange,]);

    useEffect(() => {
        if (isOpen && activeTab === 'notifications' && directChat.unreadInvitationResponseCount > 0)
            directChat.markInvitationResponsesSeen();
    }, [isOpen, activeTab, directChat.unreadInvitationResponseCount,]);

    if (!currentUser)
        return null;

    function openDock()
    {
        directChat.refreshDirectOverview();
        setIsOpen(true);
        if (!currentRoom?.id)
            setActiveTab('private');
    }

    function closeDock()
    {
        onInputFocusChange?.(false);
        setIsOpen(false);
    }

    function selectRoomTab()
    {
        if (!currentRoom?.id)
            return;
        onInputFocusChange?.(false);
        setActiveTab('room');
        setSeenRoomMessageCount(roomChat.liveMessageCount);
    }

    function selectPrivateTab()
    {
        onInputFocusChange?.(false);
        directChat.refreshDirectOverview();
        setActiveTab('private');
    }

    function selectNotificationsTab()
    {
        onInputFocusChange?.(false);
        directChat.markInvitationResponsesSeen();
        directChat.refreshDirectOverview();
        setActiveTab('notification');
    }

    return (
        <aside className="global-chat-dock">
            {!isOpen && (
                <button
                    type="button"
                    className="global-chat-toggle"
                    onClick={openDock}
                    aria-expanded="false"
                    aria-controls="global-chat-panel"
                >
                    <span className="global-chat-toggle-icon" aria-hidden="true">
                        💬
                    </span>

                    <span>Chat</span>

                    {totalUnreadCount > 0 && (
                        <span className="global-chat-unread">
                            {totalUnreadCount > 99
                                ? '99+'
                                : totalUnreadCount}
                        </span>
                    )}
                </button>
            )}

            {isOpen && (
                <section
                    id="global-chat-panel"
                    className="global-chat-panel"
                    aria-labelledby="global-chat-title"
                >
                    <header className="global-chat-header">
                        <div className="global-chat-title">
                            <span
                                className="global-chat-title-icon"
                                aria-hidden="true"
                            >
                                💬
                            </span>

                            <h2 id="global-chat-title">Chat</h2>
                        </div>

                        <button
                            type="button"
                            className="global-chat-close"
                            onClick={closeDock}
                            aria-label="Close chat"
                        >
                            ×
                        </button>
                    </header>

                    <nav
                        className="global-chat-tabs"
                        role="tablist"
                        aria-label="Chat sections"
                    >
                        <button
                            type="button"
                            role="tab"
                            className={
                                activeTab === 'room'
                                    ? 'global-chat-tab global-chat-tab--active'
                                    : 'global-chat-tab'
                            }
                            aria-selected={activeTab === 'room'}
                            disabled={!currentRoom?.id}
                            onClick={selectRoomTab}
                        >
                            <span>Room</span>

                            {roomUnreadCount > 0 && (
                                <span className="global-chat-tab-badge">
                                    {roomUnreadCount > 99
                                        ? '99+'
                                        : roomUnreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            role="tab"
                            className={
                                activeTab === 'private'
                                    ? 'global-chat-tab global-chat-tab--active'
                                    : 'global-chat-tab'
                            }
                            aria-selected={activeTab === 'private'}
                            onClick={selectPrivateTab}
                        >
                            <span>Private</span>

                            {directUnreadCount > 0 && (
                                <span className="global-chat-tab-badge">
                                    {directUnreadCount > 99
                                        ? '99+'
                                        : directUnreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            role="tab"
                            className={
                                activeTab === 'notification'
                                    ? 'global-chat-tab global-chat-tab-active'
                                    : 'global-chat-tab'
                            }
                            aria-selected={activeTab === 'notification'}
                            onClick={selectNotificationsTab}
                        >
                            <span>Notifications</span>
                            {invitationCount > 0 && (
                                <span className='global-chat-tab-badge'>
                                    {invitationCount > 99
                                        ? '99+'
                                        : invitationCount}
                                </span>
                            )}
                        </button>
                    </nav>

                    <div className="global-chat-content">
                        {activeTab === 'room' && currentRoom?.id && (
                            <ChatPanel
                                chat={roomChat}
                                compact
                                onInputFocusChange={onInputFocusChange}
                            />
                        )}

                        {activeTab === 'private' && (
                            <DirectChatPanel
                                currentUser={currentUser}
                                currentRoom={currentRoom}
                                directChat={directChat}
                                onInputFocusChange={onInputFocusChange}
                            />
                        )}

                        {activeTab === 'notification' && (
                            <InvitationPanel
                                currentUser={currentUser}
                                directChat={directChat}
                            />
                        )}
                    </div>
                </section>
            )}
        </aside>
    );
}