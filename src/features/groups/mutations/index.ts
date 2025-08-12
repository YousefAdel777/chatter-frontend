import { deleteMember, updateMember } from "../actions"

export const deleteMemberMutation = async (memberId: number, members: Member[]) => {
    await deleteMember(memberId);
    return members.filter(member => member.id !== memberId);
}

export const deleteMemberOptions = (memberId: number, members: Member[]) => {
    return {
        optimisticData: members.filter(member => member.id !== memberId),
        rollbackOnError: true,
        revalidate: false,
        populateCache: true
    }
}

export const updateMemberMutation = async (memberId: number, members: Member[], data: Partial<Member>) => {
    const updatedMember = await updateMember(memberId, data);
    return members.map(member => member.id === memberId ? updatedMember : member);
}

export const updateMemberOptions = (memberId: number, members: Member[], data: Partial<Member>) => {
    return {
        optimisticData: members.map(member => member.id === memberId ? {...member, ...data} : member),
        rollbackOnError: true,
        revalidate: false,
        populateCache: true
    }
}