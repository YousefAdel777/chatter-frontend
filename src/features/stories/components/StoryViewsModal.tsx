import Loading from "@/features/common/components/Loading";
import Modal from "@/features/common/components/Modal"
import useSWR from "swr";
import StoryView from "./StoryView";

type Props = {
    storyId: number;
    closeModal: () => void;
}

const StoryViewsModal: React.FC<Props> = ({ closeModal, storyId }) => {

    const { data: views, isLoading, error } = useSWR<StoryView[]>(`/api/story-views?storyId=${storyId}`);

    return (
        <Modal className=" h-80 max-h-80 overflow-y-auto" title="Story Views" closeModal={closeModal} >
            {
                isLoading ?
                <div className="mt-20">
                    <Loading />
                </div>
                :
                error ?
                <h3 className="text-xl font-semibold text-center">Something went wrong.</h3>
                :
                !views || views?.length === 0 ?
                <h3 className="text-xl font-semibold text-center">No views for this story.</h3>
                :
                views?.map(view => (
                    <StoryView key={view.id} storyView={view} />
                ))
            }
        </Modal>
    );
}

export default StoryViewsModal;