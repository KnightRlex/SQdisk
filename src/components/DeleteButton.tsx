import { useTranslation } from "react-i18next";

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  isDeleting: boolean;
  total: number;
  current: number;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete, isDeleting, total, current }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onDelete}
      type="button"
      disabled={isDeleting}
      className="relative overflow-hidden text-white w-full mt-3 bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:bg-gradient-to-br 
    focus:ring-4 focus:ring-red-300 focus:ring-red-800 shadow-sm shadow-red-500/50 shadow-lg shadow-red-800/80 
    font-medium rounded-lg text-sm px-5 py-2.5 text-center"
    >
      <span className="relative z-10">
        {isDeleting
          ? t('diskDetail.deleting', { current, total })
          : t('diskDetail.delete')}
      </span>

      {isDeleting &&
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent windows-shimmer"
        />
      }
    </button>
  );
};
