declare module '@toast-ui/react-image-editor';
declare module 'react-audio-player-component';

type PaginatedResponse<T> = {
    content: T[],
    pageable: {
        pageNumber: number,
        pageSize: number,
        sort: {
            empty: boolean,
            sorted: boolean,
            unsorted: boolean
        },
        offset: number,
        paged: boolean,
        unpaged: boolean
    }
    last: boolean,
    totalElements: number,
    totalPages: number,
    size: number,
    number: number,
    sort: {
        empty: boolean,
        sorted: boolean,
        unsorted: boolean
    }
    first: boolean,
    numberOfElements: number,
    empty: boolean
}

type CursorResponse<T> = {
    content: T[];
    nextCursor: number | null;
    previousCursor: number | null;
}

type User = {
    id: number;
    username: string;
    email: string;
    image: string;
    bio: string;
    createdAt: Date;
    showOnlineStatus: boolean;
    showMessageReads: boolean;
    lastOnline: Date | null;
}

type ChatType = "GROUP" | "INDIVIDUAL";

type Chat = {
    id: number;
    membersCount: number;
    chatType: ChatType;
    otherUser: User | null;
    unreadMessagesCount: number;
    firstUnreadMessageId: Message["id"] | null;
    lastMessage: LastMessage | null;
    name: string | null;
    description: string | null;
    image: string | null;
    createdAt: Date;
    onlyAdminsCanSend: boolean;
    onlyAdminsCanInvite: boolean;
    onlyAdminsCanEditGroup: boolean;
    onlyAdminsCanPin: boolean;
}

type LastMessage = {
    id: Message["id"];
    user: Message["user"]
    messageType: Message["messageType"];
    content: Message["content"];
    title: Message["title"];
    createdAt: Message["createdAt"];
    missed: Message["missed"];
    duration: Message["duration"];
    originalFileName: Message["originalFileName"];
    attachmentsCount: number | null;
}

type Group = Chat & {
    name: string;
    description: string;
    image: string;
    membersCount: number;
}

type MessageType = "TEXT" | "MEDIA" | "AUDIO" | "FILE" | "INVITE" | "CALL" | "POLL" | "STORY";

type Message = {
    id: number;
    chatId: number;
    user: User | null;
    createdAt: string;
    messageType: MessageType;
    reacts: MessageReact[];
    content: string | null;
    attachments: Attachment[];
    story?: Story;
    expiresAt: Date | null;
    seen: boolean;
    pinned: boolean;
    starred: boolean;
    forwarded: boolean;
    edited: boolean;
    missed: boolean | null;
    duration: number | null;
    fileUrl: string | null;
    originalFileName: string | null;
    fileSize: number | null;
    options: Option[] | null;
    multiple: boolean | null;
    endsAt: Date | null;
    title: string | null;
    replyMessage: Message | null;
    invite: Invite | null; 
}

type Invite = {
    id: number;
    inviteChat: Chat;
    canUseLink: boolean;
    expiresAt: Date | null;
    createdAt: Date;
}

type MessageRead = {
    id: number;
    messageId: number;
    user: User;
    createdAt: Date;
    showRead: boolean;
}

type MessageReact = {
    id: number;
    messageId: number;
    emoji: string;
    user: User;
}

type Attachment = {
    id: number;
    messageId: number;
    filePath: string;
    attachmentType: AttachmentType;
}

type AttachmentType = "IMAGE" | "VIDEO";

type Member = {
    id: number;
    chatId: number;
    user: User;
    joinedAt: string;
    memberRole: MemberRole;
}

type MemberRole = "MEMBER" | "ADMIN" | "OWNER";

type Block = {
    id: number;
    blockerId: number;
    blockedId: number;
}

type Vote = {
    id: number;
    optionId: number;
    user: User;
}

type Option = {
    id: number;
    votes: Vote[];
    title: string;
    messageId: number;
}

type Story = {
    id: number;
    user: User;
    content: string;
    backgroundColor?: string;
    textColor?: string; 
    filePath: string;
    createdAt: string;
    storyType: StoryType;
    excludedUsersIds: number[];
    isViewed: boolean;
};

type StoryView = {
    id: number;
    user: User;
    storyId: number;
    createdAt: Date;
}

type StoryType = "VIDEO" | "IMAGE" | "TEXT";

type FiltersContextType = {
    pinned: boolean,
    starred: boolean,
    messageType: MessageType | null,
    search: string,
    isFiltered: boolean;
    togglePinned: () => void;
    toggleStarred: () => void;
    resetFilters: () => void;
    setMessageType: (messageType: MessageType | null) => void;
    setSearch: (search: string) => void;
};

type MessagesContextType = {
    dataBeforeJump?: CursorResponse<Message>[];
    paginatedDataAfter?: CursorResponse<Message>[];
    paginatedDataBefore?: CursorResponse<Message>[];
    hasMoreAfter: boolean;
    hasMoreBefore: boolean;
    messages: Message[];
    isError: boolean;
    isLoading: boolean;
    mutateAfter: import("swr/infinite").SWRInfiniteKeyedMutator<CursorResponse<Message>[]>;
    mutateBefore: import("swr/infinite").SWRInfiniteKeyedMutator<CursorResponse<Message>[]>;
    setAfterSize: (size: number | ((_size: number) => number)) => Promise<CursorResponse<Message>[] | undefined>;
    setBeforeSize: (size: number | ((_size: number) => number)) => Promise<CursorResponse<Message>[] | undefined>;
}