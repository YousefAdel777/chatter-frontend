import { useState, useEffect, useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';

const useMessages = (url: string, pageSize: number, messageId?: number, disabled?: boolean) => {
  const [dataBeforeJump, setDataBeforeJump] = useState<CursorResponse<Message>[]>(); 
  const [jumpMessageId, setJumpMessageId] = useState<number>();
  const [isJump, setIsJump] = useState(false);
  const [minId, setMinId] = useState(Number.MAX_SAFE_INTEGER);
  const separator = useMemo(() => url.indexOf("?") === -1 ? "?" : "&", [url]);

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
    if (messageId && messageId < minId) {
      setIsJump(true)
      setJumpMessageId(messageId);
    }
  }, [messageId, minId]);

  const error = errorBefore || errorAfter;
  const isLoading = isLoadingBefore || isLoadingAfter;
  const messages = useMemo(() => {
    const beforeData = paginatedDataBefore?.flatMap(p => p.content || []) || [];
    const afterData = paginatedDataAfter?.flatMap(p => p.content || []) || [];
    return [...beforeData.reverse(), ...afterData];
  }, [paginatedDataBefore, paginatedDataAfter]);
  
  const hasMoreAfter = !!paginatedDataAfter?.[paginatedDataAfter.length - 1]?.previousCursor;
  const hasMoreBefore = !!paginatedDataBefore?.[paginatedDataBefore.length - 1]?.nextCursor;

  return {
    dataBeforeJump,
    paginatedDataAfter,
    paginatedDataBefore,
    mutateAfter,
    mutateBefore,
    messages,
    hasMoreAfter,
    hasMoreBefore,
    isError: !!error,
    isLoading,
    setAfterSize,
    setBeforeSize,
  };
};

export default useMessages;