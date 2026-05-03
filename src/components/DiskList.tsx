import { useEffect, useState } from "react";
import DiskItem from "./DiskItem";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { platform } from "@tauri-apps/plugin-os";
import { open } from "@tauri-apps/plugin-dialog";
import folderIcon from "../assets/folder.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // <--- NUEVO

declare global { interface Window { electron: any; analytics: any; configStore: any; licver: any; } }

const DiskList = () => {
  const [disks, setDisks] = useState([]);
  const [appVersion, setAppVersion] = useState("1.0.0");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => { getVersion().then((v) => setAppVersion(v)); }, []);

  useEffect(() => {
    const syncDisks = async () => {
      const disksString: string = await invoke("get_disks");
      const disks = JSON.parse(disksString);
      const plat = platform();
      let filtered = disks.filter((disk: any) => {
        if (plat === "macos" && disk.sMountPoint === "/System/Volumes/Data") return false;
        if (plat === "linux" && disk.sMountPoint === "/var/snap/firefox/common/host-hunspell") return false;
        if (plat === "linux" && disk.sMountPoint === "/boot/efi") return false;
        return true;
      });
      setDisks(filtered);
    };
    const handle = setInterval(syncDisks, 2000);
    syncDisks();
    return () => { clearInterval(handle); };
  }, []);
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-white flex-1">
        {disks.map((disk: any) => (<DiskItem key={disk.sMountPoint} disk={disk}></DiskItem>))}
        <div className="text-white p-4 flex gap-4 items-center hover:bg-gray-800 cursor-pointer" onClick={() => { open({ multiple: false, directory: true }).then((directory) => { if (directory) navigate("/disk", { state: { disk: (directory as string).replace(/\\/g, "/"), used: 0, fullscan: false, isDirectory: true } }); }); }}>
          <div className="w-16 h-16 flex justify-center items-center align-middle"><img src={folderIcon} className="w-12 h-12 opacity-70"></img></div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-white text-sm">{t('home.selectFolder')}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 text-white justify-between w-full flex">
        <div>{t('home.tip')}</div>
        <div>v. {appVersion}</div>
      </div>
    </div>
  );
};
export default DiskList;