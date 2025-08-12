import clsx from "clsx";

type Props = {
    checked: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const Switch: React.FC<Props> = ({ checked, onChange }) =>  {
    return (
        <label className="flex items-center cursor-pointer">
            <div className="relative">
                <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
                <div className={clsx("block bg-background-secondary w-14 h-8 rounded-full trasnition", {
                    "bg-primary" : checked
                })} />
                <div className={clsx("absolute left-1 top-1 bg-background w-6 h-6 rounded-full transition ", {
                    "translate-x-full": checked
                })} />
            </div>
        </label>
    );
}

export default Switch;