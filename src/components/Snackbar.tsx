import { useTranslation } from "react-i18next";
import info from "../assets/info.svg";

export enum SnackbarSeverity {
    SUCCESS = "success",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info"
}

export interface SnackbarProps {
    message: string;
    severity: SnackbarSeverity;
    onClick: () => void;
}

export const SnackbarContainer = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="flex flex-col gap-3.5 absolute bottom-4 z-50 right-4">
            {children}
        </div>
    )
}

export const Snackbar = (props: SnackbarProps) => {
    const { t } = useTranslation();
    let bgColor = "";
    let bgColorHover = "";

    switch (props.severity) {
        case SnackbarSeverity.SUCCESS:
            bgColor = "bg-green-900";
            bgColorHover = "hover:bg-green-950";
            break;
        case SnackbarSeverity.ERROR:
            bgColor = "bg-red-900";
            bgColorHover = "hover:bg-red-950";
            break;
        case SnackbarSeverity.WARNING: 
            bgColor = "bg-yellow-900";
            bgColorHover = "hover:bg-yellow-950";
            break;
        case SnackbarSeverity.INFO:
            bgColor = "bg-blue-900";
            bgColorHover = "hover:bg-blue-950";
            break;
    }

    return (
    <button className={`flex flex-row items-center text-white px-4 py-2 rounded ${bgColor} ${bgColorHover}`} onClick={props.onClick}>
        <img src={info} alt="Info" className="w-5 h-5 mr-2" />
        <p className="max-w-xs truncate">{props.message}</p>
    </button>
    );
}