import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import diskIcon from "../assets/harddisk.png";
import { getChart } from "../d3chart";
import * as d3 from "d3";
import {
  buildPath,
  getViewNode,
  getViewNodeGraph,
  buildFullPath,
  diskItemToD3Hierarchy,
  itemMap,
} from "../pruneData";
import { FileLine } from "./FileLine";
import { ParentFolder } from "./ParentFolder";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { invoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";

import { remove } from "@tauri-apps/plugin-fs";

import { useTranslation } from "react-i18next";

(window as any).LockDNDEdgeScrolling = () => true;

const Scanning = () => {
  let {
    state: { disk, used, fullscan },
  } = useLocation() as any;
  const navigate = useNavigate();

  const svgRef = useRef<SVGSVGElement | null>(null);

  const baseData = useRef<DiskItem | null>(null);
  const baseDataD3Hierarchy = useRef<D3HierarchyDiskItem | null>(null);

  const [focusedDirectory, setFocusedDirectory] =
    useState<D3HierarchyDiskItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<DiskItem | null>(null);

  const worker = useRef<Worker | null>(null);
  const d3Chart = useRef(null) as any;
  const [view, setView] = useState("loading");
  const [status, setStatus]: any = useState(null);
  const [deleteState, setDeleteState] = useState({
    isDeleting: false,
    total: 0,
    current: 0,
  });

  const [elapsedTime, setElapsedTime] = useState(0);

  const [deleteList, setDeleteList] = useState<Array<D3HierarchyDiskItem>>([]);
  const deleteMap = useRef<Map<string, boolean>>(new Map());
  const timerWorker = useRef<Worker | null>(null);

  const { t } = useTranslation();

  const rawProgress = status && used > 0 
    ? (Math.min(status.total, used) / used) * 100 
    : 0;
  const displayProgress = Math.min(rawProgress, 95);

  useEffect(() => {
    if (view !== "loading") {
      // Detener el timer cuando salimos de la vista de carga
      if (timerWorker.current) {
        timerWorker.current.postMessage({ command: 'stop' });
        timerWorker.current.terminate();
        timerWorker.current = null;
      }
      return;
    }
    
    // Crear el Web Worker para el timer
    timerWorker.current = new Worker(new URL('../workers/timerWorker.ts', import.meta.url));
    
    // Escuchar mensajes del worker
    timerWorker.current.onmessage = function(e) {
      if (e.data.command === 'tick') {
        setElapsedTime(e.data.seconds);
      }
    };
    
    // Iniciar el timer
    timerWorker.current.postMessage({ command: 'start' });

    return () => {
      // Limpiar el worker cuando el componente se desmonte
      if (timerWorker.current) {
        timerWorker.current.postMessage({ command: 'stop' });
        timerWorker.current.terminate();
        timerWorker.current = null;
      }
    };
  }, [view]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    if (baseData.current) {
      return;
    }
    
    const unlisten = listen("scan_status", (event: any) => {
      setStatus(event.payload);
    });

    const unlisten2 = listen("scan_completed", (event: any) => {
      
      setStatus({ items: 999999999, total: 999999999 });
      
      // Usar setTimeout para no bloquear el UI inmediatamente
      setTimeout(() => {
        try {
          baseData.current = JSON.parse(event.payload).tree;
          const mapped = itemMap(baseData.current);
          baseDataD3Hierarchy.current = diskItemToD3Hierarchy(mapped as any);
          setView("disk");
        } catch (error) {
          console.error("Error procesando JSON:", error);
        }
      }, 0);
    });

    invoke("start_scanning", { path: disk, ratio: fullscan ? "0" : "0.001" });

    return () => {
      unlisten.then((f) => f());
      unlisten2.then((f) => f());
      invoke("stop_scanning", { path: disk });
    };
  }, [disk, setStatus]);

  useEffect(() => {
    if (view == "disk") {
      d3.select(svgRef.current).selectAll("*").remove();

      const rootDir = baseDataD3Hierarchy.current!;
      setFocusedDirectory(rootDir);

      const base = baseDataD3Hierarchy.current!;

      d3Chart.current = getChart(base, svgRef.current!, {
        centerHover: (_, p) => {
          setHoveredItem({ ...p.data });
        },
        arcHover: (_, p) => {
          setHoveredItem({ ...p.data });
        },
        arcClicked: (_, p) => {
          setFocusedDirectory(p);
          return p;
        },
      });
    }
  }, [view]);

  return (
    <>
      {view == "loading" && status && (
        <div className="flex-1 flex flex-col justify-center items-center justify-items-center">
          <img src={diskIcon} className="w-16 h-16"></img>
          <div className="w-2/3">
            <div className="mt-5 mb-1 text-base text-center font-medium text-white">
              {t('scanning.scanning')} {disk} {displayProgress.toFixed(2)}%
              <br />
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: displayProgress + "%" }}
              ></div>
            </div>
            <div className="mt-6 text-sm text-white text-center font-mono">
              {formatTime(elapsedTime)}
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-6 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white text-white focus:ring-4 focus:ring-blue-300 focus:ring-blue-800"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-opacity-0">
              {t('scanning.back')}
            </span>
          </button>
        </div>
      )}
      {view == "disk" && (
        <div className="flex-1 flex">
          <DragDropContext
            onDragEnd={(result) => {
              console.log(result);
              if (result.destination?.droppableId !== "deletelist") {
                return;
              }
              const item = focusedDirectory!.children!.find(
                (i) => i.data.id === result.draggableId
              );
              setDeleteList((val) => {
                if (!val.find((e) => e.data.id === item!.data.id)) {
                  deleteMap.current.set(item!.data.id, true);
                  return [...val, item!];
                } else {
                  return val;
                }
              });
            }}
          >
            <div className="flex flex-1">
              <div id="d3-tooltip" className="d3-tooltip" style={{ display: 'none' }}></div>
              <div className="chartpartition flex-1 flex justify-items-center items-center">
                <svg
                  ref={svgRef}
                  width={"100%"}
                  style={{ maxHeight: "calc(100vh - 40px)" }}
                />
              </div>

              <div className="bg-gray-900 w-1/3 p-2 flex flex-col">
                {focusedDirectory && (
                  <ParentFolder
                    focusedDirectory={focusedDirectory}
                    d3Chart={d3Chart}
                  ></ParentFolder>
                )}
                <Droppable droppableId="filelist">
                  {(provided) => (
                    <div
                      className="overflow-y-auto"
                      style={{ flex: "1 1 auto", height: 100 }}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {focusedDirectory &&
                        focusedDirectory.children &&
                        focusedDirectory.children.map((c, index) => (
                          <FileLine
                            key={c.data.id}
                            item={c}
                            hoveredItem={hoveredItem}
                            d3Chart={d3Chart}
                            index={index}
                            deleteMap={deleteMap.current}
                          ></FileLine>
                        ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <Droppable droppableId="deletelist">
                  {(provided) => (
                    <div
                      className="pt-1 flex-initial"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <div className="rounded-lg border border-gray-500 border-dashed p-2 text-gray-500 text-center mb-0">
                        {deleteList.length == 0 && (
                          <>{t('diskDetail.dragToDelete')}</>
                        )}
                        {deleteList.length > 0 && (
                          <div>
                            <div>
                              {t('diskDetail.filesSelected', { count: deleteList.length })}{" "}
                              <a
                                href="#"
                                className="underline underline-offset-2"
                                onClick={() => {
                                  setDeleteList([]);
                                  deleteMap.current.clear();
                                }}
                              >
                                {t('diskDetail.clearSelection')}
                              </a>
                            </div>
                          </div>
                        )}
                        <div>{provided.placeholder}</div>
                        {deleteList.length > 0 && (
                          <button
                            onClick={async () => {
                              setDeleteState({
                                isDeleting: true,
                                total: deleteList.length,
                                current: 0,
                              });
                              let successful: Array<D3HierarchyDiskItem> = [];
                              for (let node of deleteList) {
                                const nodePath = buildFullPath(node)
                                  .replace("\\/", "/")
                                  .replace("\\", "/");
                                try {
                                  await remove(nodePath, { recursive: true }).catch((err) =>
                                    console.error(err)
                                  );
                                  successful.push(node);
                                  setDeleteState((prev) => ({
                                    ...prev,
                                    current: prev.current + 1,
                                  }));
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                              d3Chart.current.deleteNodes(successful);
                              setDeleteState((prev) => ({
                                isDeleting: false,
                                total: 0,
                                current: 0,
                              }));
                              setDeleteList([]);
                              deleteMap.current.clear();
                            }}
                            type="button"
                            disabled={deleteState.isDeleting}
                            className="text-white w-full mt-3 bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:ring-red-300 focus:ring-red-800 shadow-sm shadow-red-500/50 shadow-lg shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                          >
                            {deleteState.isDeleting
                              ? t('diskDetail.deleting', { current: deleteState.current, total: deleteState.total })
                              : t('diskDetail.delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
        </div>
      )}
    </>
  );
};

export default Scanning;