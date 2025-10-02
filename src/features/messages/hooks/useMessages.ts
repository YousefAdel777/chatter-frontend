import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { batchUpdateMessagesMutation, createMessageMutationAfter, createMessageMutationBefore, deleteMessageMutation, updateMessageMutation } from "../mutations";
import { Client } from "@stomp/stompjs";
const BASE_WS_URL = process.env.NEXT_PUBLIC_BASE_WS_URL;

const useMessages = (url: string, pageSize: number, initialLastMessageId?: number, chatId?: number, messageId?: number, disabled?: boolean, forceFetch?: boolean) => {
  const [dataBeforeJump, setDataBeforeJump] = useState<CursorResponse<Message>[]>(); 
  const [jumpMessageId, setJumpMessageId] = useState<number>();
  const [isJump, setIsJump] = useState(false);
  const [minId, setMinId] = useState(Number.MAX_SAFE_INTEGER);
  const [lastMessageId, setLastMessageId] = useState<number>();
  const stompClient = useRef<Client | null>(null);
  const { data: session } = useSession();
  const separator = useMemo(() => url.indexOf("?") === -1 ? "?" : "&", [url]);
  
  useEffect(() => {
    if (!initialLastMessageId) return;
    setLastMessageId(initialLastMessageId);
  }, [initialLastMessageId]);

  const getKeyBefore = useCallback((pageIndex: number, previousPageData: CursorResponse<Message> | null) => {
    if (disabled) return null;
    if (previousPageData && !previousPageData.content) return null;
    if (pageIndex === 0) {
      if (isJump && jumpMessageId) {
        return `${url}${separator}before=${jumpMessageId + 1}&size=${pageSize}`;
      }
      else {
        return `${url}${separator}size=${pageSize}`;
      }
    };
    
    return `${url}${separator}before=${previousPageData?.nextCursor}&size=${pageSize}`; 
  }, [url, separator, pageSize, isJump, jumpMessageId, disabled]);

  const {
    data: paginatedDataBefore,
    error: errorBefore,
    setSize: setBeforeSize,
    mutate: mutateBefore,
    isLoading: isLoadingBefore
  } = useSWRInfinite<CursorResponse<Message>>(getKeyBefore, {
    onSuccess: (data) => {
      const cursor = data[data.length - 1].nextCursor;
      if (cursor && cursor < minId) {
        setMinId(cursor);
      }
      if (forceFetch) {
        setMinId(Number.MAX_SAFE_INTEGER);
      }
      setDataBeforeJump(data);
    },
  });

  const getAfterKey = useCallback((pageIndex: number, previousPageData: CursorResponse<Message> | null) => {
    if (disabled) return null;
    if (previousPageData && !previousPageData.content) return null;
    if (!jumpMessageId) return null;
    if (previousPageData && !previousPageData.previousCursor) return null;
    if (pageIndex === 0) {
      return `${url}${separator}after=${jumpMessageId}&size=${pageSize}`
    }
    return `${url}${separator}after=${previousPageData?.nextCursor}&size=${pageSize}`;
  }, [jumpMessageId, url, separator, pageSize, disabled]);

  const {
    data: paginatedDataAfter,
    error: errorAfter,
    mutate: mutateAfter,
    setSize: setAfterSize,
    isLoading: isLoadingAfter
  } = useSWRInfinite<CursorResponse<Message>>(getAfterKey);

  useEffect(() => {
    if (messageId && (messageId < minId || forceFetch)) {
      setIsJump(true)
      setJumpMessageId(messageId);
    }
  }, [messageId, minId, forceFetch]);

  const error = errorBefore || errorAfter;
  const isLoading = isLoadingBefore || isLoadingAfter;
  const messages = useMemo(() => {
    const beforeData = paginatedDataBefore?.flatMap(p => p.content || []) || [];
    const afterData = paginatedDataAfter?.flatMap(p => p.content || []) || [];
    return [...beforeData.reverse(), ...afterData];
  }, [paginatedDataBefore, paginatedDataAfter]);
  
  const hasMoreAfter = !!paginatedDataAfter?.[paginatedDataAfter.length - 1]?.previousCursor;
  const hasMoreBefore = !!paginatedDataBefore?.[paginatedDataBefore.length - 1]?.nextCursor;

  useEffect(() => {
    if (!chatId || !session?.user?.accessToken) return;
    stompClient.current = new Client({
        brokerURL: BASE_WS_URL,
        connectHeaders: {
            "Authorization": `Bearer ${session?.user?.accessToken}`
        },
        onStompError: (e) => {
          console.log(e);
        }
    });

    stompClient.current.onConnect = () => {
        const options = {
            revalidate: false,
            populateCache: true,
            rollbackOnError: true,
        }
        stompClient.current?.subscribe(`/topic/chat.${chatId}.created-messages`, (message) => {
            const newMessage: Message = JSON.parse(message.body);
            if (newMessage.user?.id.toString() === session?.user?.id) return;
            if (hasMoreAfter) return;
            if (paginatedDataAfter) {
                mutateAfter(createMessageMutationAfter(paginatedDataAfter, newMessage), options);
            }
            else if (paginatedDataBefore) {
                mutateBefore(createMessageMutationBefore(paginatedDataBefore, newMessage), options);
            }
            else {
                mutateBefore([{ content: [newMessage], nextCursor: null, previousCursor: null }], { revalidate: false, populateCache: true, rollbackOnError: true });
            } 
        });

        stompClient.current?.subscribe(`/topic/chat.${chatId}.edited-messages?userId=${session.user?.id}`, (message) => {
            const updatedMessage = JSON.parse(message.body);
            if (paginatedDataAfter) {
                mutateAfter(updateMessageMutation(updatedMessage.id, updatedMessage, paginatedDataAfter), options);
            }
            else if (paginatedDataBefore) {
                mutateBefore(updateMessageMutation(updatedMessage.id, updatedMessage, paginatedDataBefore), options);
            }
        });

        stompClient.current?.subscribe(`/topic/chat.${chatId}.edited-messages-batch?userId=${session.user?.id}`, (message) => {
            const updatedMessages = JSON.parse(message.body);
            if (paginatedDataAfter) {
                mutateAfter(batchUpdateMessagesMutation(updatedMessages, paginatedDataAfter), options);
            }
            else if (paginatedDataBefore) {
                mutateBefore(batchUpdateMessagesMutation(updatedMessages, paginatedDataBefore), options);
            }
        });

        stompClient.current?.subscribe(`/topic/chat.${chatId}.deleted-messages`, (message) => {
            const deletedMessageId = JSON.parse(message.body);
            if (paginatedDataAfter) {
                mutateAfter(deleteMessageMutation(deletedMessageId, paginatedDataAfter), {
                    revalidate: false,
                    populateCache: true,
                    rollbackOnError: true,
                });
            }
            else if (paginatedDataBefore) {
                mutateBefore(deleteMessageMutation(deletedMessageId, paginatedDataBefore), {
                    revalidate: false,
                    populateCache: true,
                    rollbackOnError: true,
                });
            }
        });

        stompClient.current?.subscribe(`/topic/chat.${chatId}.last-message-id`, (message) => {
          const messageId = JSON.parse(message.body);
          console.log(messageId)
          setLastMessageId(messageId);
        });

    };
    
    stompClient.current.activate();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
}, [mutateAfter, mutateBefore, paginatedDataAfter, paginatedDataBefore, hasMoreAfter, chatId, session?.user?.id, session?.user?.accessToken]);

  return {
    dataBeforeJump,
    paginatedDataAfter,
    paginatedDataBefore,
    messages,
    hasMoreAfter,
    hasMoreBefore,
    isError: !!error,
    isLoading,
    lastMessageId,
    mutateAfter,
    mutateBefore,
    setAfterSize,
    setBeforeSize,
  };
};

export default useMessages;