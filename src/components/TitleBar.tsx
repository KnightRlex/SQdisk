import Logo from "../assets/squirrel.png";
import Close from "../assets/Close.svg";
import { Link, useLocation } from "react-router-dom";
import { Platform, platform } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useTranslation } from "react-i18next";

const appWindow = getCurrentWebviewWindow()

const CloseButton = () => (
  <button onClick={() => appWindow.close()} className="hover:bg-red-600 p-1 rounded">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

const MinimizeButton = () => (
  <button onClick={() => appWindow.minimize()} className="hover:bg-gray-600 p-1 rounded">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  </button>
);

const TitleBar = () => {
  let { state, pathname } = useLocation() as any;
  const [plf] = useState<Platform | undefined>(platform());
  const { t } = useTranslation(); // <--- NUEVO

  return (
    <div data-tauri-drag-region className="flex bg-cyan-800 h-12 justify-between w-full items-center pl-3 pr-3 titlebar text-white" style={{ background: "#0F1831" }}>
      {plf !== "macos" ? <img src={Logo} className="h-6 w-6" /> : <CloseButton />}
      <div className="font-bold">
        <nav className="flex navi" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="inline-flex items-center text-sm cursor-pointer text-gray-400 hover:text-white">SQDisk</Link>
            </li>
            {pathname == "/disk" && (
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  <Link to="/" className="ml-1 text-sm font-medium cursor-pointer md:ml-2 text-gray-400 hover:text-white">{t('breadcrumb.allDisks')}</Link>
                </div>
              </li>
            )}
            {state && state.disk && (
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  <span className="ml-1 text-sm font-medium md:ml-2 text-gray-500">
                    {state.isDirectory ? t('breadcrumb.folder') : t('breadcrumb.disk')} ({state.disk})
                  </span>
                </div>
              </li>
            )}
          </ol>
        </nav>
      </div>
      <div className="flex gap-1">
        {plf !== "macos" ? (<><MinimizeButton /><CloseButton /></>) : <img src={Logo} className="h-6 w-6" />}
      </div>
    </div>
  );
};
export default TitleBar;