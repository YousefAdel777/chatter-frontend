export const createMessageMutationAfter = (paginatedDataAfter: CursorResponse<Message>[], createdMessage: Message) => {
    const lastPage = paginatedDataAfter[paginatedDataAfter.length - 1];
    const updatedLastPage = {
        ...lastPage,
        content: [...lastPage.content, createdMessage],
    };
    return [
        ...paginatedDataAfter.slice(0, -1),
        updatedLastPage,
    ];
}

export const createMessageMutationBefore = (paginatedDataBefore: CursorResponse<Message>[], createdMessage: Message) => {
    const firstPage = paginatedDataBefore[0];
    const updatedLastPage = {
        ...firstPage,
        content: [createdMessage, ...firstPage.content],
    };
    return [
        updatedLastPage,
        ...paginatedDataBefore.slice(1),
    ];
}

export const deleteMessageMutation = (messageId: number, messagesData: CursorResponse<Message>[]) => {
    return messagesData.map(messages => ({ ...messages, content: messages.content.filter(message => message.id !== messageId) }));
}

export const deleteMessageOptions = (messageId: number, messagesData: CursorResponse<Message>[]) => {
    return {
        optimisticData: messagesData.map(messages => ({ ...messages, content: messages.content.filter(message => message.id !== messageId) })), 
        populateCache: true,
        revalidate: false,
        rollbackOnError: true,
    };
}

export const updateMessageMutation = (messageId: number, data: Partial<Message>, messagesData: CursorResponse<Message>[]) => {
    const mutatedData = messagesData.map(messages => ({ ...messages, content: messages.content.map(message => message.id === messageId ? { ...message, ...data } : message) }));
    return mutatedData;
}

export const batchUpdateMessagesMutation = (newMessages: Message[], messagesData: CursorResponse<Message>[]) => {
    return messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                const updated = newMessages.find(m => m.id === message.id);
                if (updated) {
                    return updated;
                }
                return message;
            }),
        }
    });
}

export const updateMessageOptions = (messageId: number, data: Partial<Message>, messagesData: CursorResponse<Message>[]) => {
    return {
        optimisticData: messagesData.map(messages => ({ ...messages, content: messages.content.map(message => message.id === messageId ? { ...message, ...data } : message) })), 
        populateCache: true,
        revalidate: false,
        rollbackOnError: true,
    };
}

export const createReactMutation = (data: { messageId: number, emoji: string }, user: User, messagesData: CursorResponse<Message>[]) => {
    const mutatedData = messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (message.id === data.messageId) {
                    return { ...message, reacts: [...message.reacts, { ...data, id: Math.random(), user }] };
                }
                return message;
            })
        };
    });
    return mutatedData;
}

export const updateReactMutation = (reactId: number, messageId: number, data: Partial<MessageReact>, messagesData: CursorResponse<Message>[]) => {
    const mutatedData = messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (message.id === messageId) {
                    return { ...message, reacts: message.reacts.map(react => react.id === reactId ? { ...react, ...data } : react) };
                }
                return message;
            })
        };
    });
    return mutatedData;
}

export const updateReactOptions = (reactId: number, data: Partial<MessageReact>, messagesData: CursorResponse<Message>[]) => {
    const optimisticData = messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                return {
                    ...message,
                    reacts: message.reacts.map(react => react.id === reactId ? { ...react, ...data } : react)
                }
            })
        };
    });
    return {
        optimisticData,
        populateCache: true,
        revalidate: false,
        rollbackOnError: true,
    };
}

export const deleteReactMutation = async (reactId: number, messagesData: CursorResponse<Message>[]) => {
    const mutatedData = messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                return { ...message, reacts: message.reacts.filter(react => react.id !== reactId) };
            })
        };
    });
    return mutatedData;
}

export const deleteReactOptions = (reactId: number, messagesData: CursorResponse<Message>[]) => {
    return {
        optimisticData: messagesData.map(messages => {
            return {
                ...messages,
                content: messages.content.map(message => {
                    return { ...message, reacts: message.reacts.filter(react => react.id !== reactId) };
                })
            };
        }),
        populateCache: true,
        revalidate: false,
        rollbackOnError: true,
    };
}

export const createVotesMutation = (messageId: number, user: User, data: { optionsIds: number[] }, messagesData: CursorResponse<Message>[]) => {
    const votes = data.optionsIds.map(optionId => ({ optionId, user, id: Math.random() }));
    return messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (message.id === messageId) {
                    return {
                        ...message,
                        options: message.options?.map(option => {
                            return {
                                ...option,
                                votes: [...option.votes, ...votes.filter(vote => vote.optionId === option.id)]
                            }
                        }) || null,
                    }
                }
                return message;
            })
        }
    });
}

export const createVotesOptions = (messageId: number, userId: number, data: { optionsIds: number[] }, messagesData: CursorResponse<Message>[]) => {
    const votes: Vote[] = data.optionsIds.map(optionId => ({ optionId, id: 1, user: { id: userId } })) as Vote[];
    return {
        optimisticData: messagesData.map(messages => {
            return {
                ...messages,
                content: messages.content.map(message => {
                    if (message.id === messageId) {
                        return {
                            ...message,
                            options: message.options?.map(option => {
                                return {
                                    ...option,
                                    votes: [...option.votes, ...(votes?.filter(vote => vote.optionId === option.id) || [])]
                                }
                            }) || [],
                        }
                    }
                    return message;
                })
            }
        }),
        populateCache: true,
        revalidate: false,
        rollbackOnError: true,
    }
}

export const deleteVotesMutation = (messageId: number, userId: number, messagesData: CursorResponse<Message>[]) => {
    return messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (message.id === messageId) {
                    return {
                        ...message,
                        options: message.options?.map(option => {
                            return {
                                ...option,
                                votes: option.votes.filter(vote => vote.user.id !== userId)
                            }
                        }) || null,
                    };
                }
                return message;
            })
        };
    });
}

export const deleteVotesOptions = (messageId: number, userId: number, messagesData: CursorResponse<Message>[]) => {
    return {
        optimisticData: messagesData.map(messages => {
            return {
                ...messages,
                content: messages.content.map(message => {
                    if (message.id === messageId) {
                        return {
                            ...message,
                            options: message.options?.map(option => {
                                return {
                                    ...option,
                                    votes: option.votes.filter(vote => vote.user.id !== userId)
                                }
                            }) || null,
                        };
                    }
                    return message;
                })
            };
        }),
        populateCache: true,
        revalidate: false,
        rollbackOnError: true,
    }
}

export const markMessageAsReadMutation = (messageId: number, messagesData: CursorResponse<Message>[]) => {
    return messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (message.id === messageId) {
                    return {
                        ...message,
                        seen: true,
                    };
                }
                return message;
            })
        };
    });
}

export const markChatMessagesAsReadMutation = (chatId: number, messagesData: CursorResponse<Message>[]) => {
    return messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                return {
                    ...message,
                    seen: true,
                };
            })
        };
    });
}

export const markChatMessagesAsReadMutationOptions = (chatId: number, messagesData: CursorResponse<Message>[], userId: number) => {
    const data = messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (!message.isSeen && message.chatId === chatId && message.user?.id === userId) {
                    return {
                        ...message,
                        seen: true,
                    };
                }
                return message;
            })
        };
    });
    return {
        optimisticData: data,
        revalidate: false,
        populateCache: true,
        rollbackOnError: true
    };
}

export const pinMessageMutation = (messageId: number, messagesData: CursorResponse<Message>[], pinned: boolean) => {
    return messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (messageId === message.id) {
                    return {
                        ...message,
                        pinned
                    };
                }
                return message;
            })
        };
    }); 
}

export const pinMessageOptions = (messageId: number, messagesData: CursorResponse<Message>[], pinned: boolean) => {
    const data = messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (messageId === message.id) {
                    return {
                        ...message,
                        pinned
                    };
                }
                return message;
            })
        };
    });
    return {
        optimisticData: data,
        revalidate: false,
        populateCache: true,
        rollbackOnError: true
    };
}

export const starMessageMutation = (messageId: number, messagesData: CursorResponse<Message>[], starred: boolean) => {
    return messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (messageId === message.id) {
                    return {
                        ...message,
                        starred
                    };
                }
                return message;
            })
        };
    }); 
}

export const starMessageMutationOptions = (messageId: number, messagesData: CursorResponse<Message>[], starred: boolean) => {
    const data = messagesData.map(messages => {
        return {
            ...messages,
            content: messages.content.map(message => {
                if (messageId === message.id) {
                    return {
                        ...message,
                        starred
                    };
                }
                return message;
            })
        };
    });
    return {
        optimisticData: data,
        revalidate: false,
        populateCache: true,
        rollbackOnError: true
    };
}