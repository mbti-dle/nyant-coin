import useToastStore from "@/store/use-toast-store";

const toast = () => {
    const { isVisible, message, icon } = useToastStore()

    if (!isVisible) return null

    return (
        <div>
            toast
        </div>
    )};

export default toast