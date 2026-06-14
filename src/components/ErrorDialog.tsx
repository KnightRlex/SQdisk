import { t } from "i18next";

export const ErrorDialog = ({ title: title, error, onClose }: { title: string; error: any; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-[2px] mt-(--title-bar-height) z-50">
      <div className="bg-gray-800 text-white rounded-lg p-6 w-1/2">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="overflow-y-auto max-h-48 py-2 mb-6">
          <p>{error}</p>
        </div>
        <div className="flex justify-end">
          <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 shadow-lg shadow-black/66" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}