use std::fs;
use std::ops::Not;

use regex::{Captures, Regex};

use tauri_plugin_shell::{process::CommandEvent, ShellExt};
use tauri::{Emitter, Manager};

use crate::MyState;

#[derive(Clone, serde::Serialize)]
struct Payload {
    items: u64,
    total: u64,
    errors: u64,
}

// Start scan
pub fn start(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, MyState>,
    path: String,
    ratio: String,
) -> Result<(), ()> {
    println!("Start Scanning {}", path);
    let ratio = ["--min-ratio=", ratio.as_str()].join("");

    let mut paths_to_scan: Vec<String> = Vec::new();
    paths_to_scan.push("--json-output".to_string());
    paths_to_scan.push("--progress".to_string());
    paths_to_scan.push(ratio);

    if path.eq("/") {
        let paths = fs::read_dir("/").unwrap();
        println!("{:#?}", paths);
        let banned = [
            "/dev", "/mnt", "/cdrom", "/proc", "/media", "/Volumes", "/System",
        ];

        for scan_path in paths {
            let scan_path_str = scan_path.unwrap().path();
            if banned.contains(&(scan_path_str.to_str().unwrap())).not() {
                paths_to_scan.push(scan_path_str.display().to_string());
            }
        }
    } else {
        paths_to_scan.push(path);
    }

    let shell = app_handle.shell();
    
    let (mut rx, child) = shell.sidecar("pdu")
        .expect("failed to create `pdu` sidecar command")
        .args(paths_to_scan)
        .spawn()
        .expect("Failed to spawn sidecar");
    
    *state.0.lock().unwrap() = Some(child);

    let re = Regex::new(r"\(scanned ([0-9]*), total ([0-9]*)(?:, erred ([0-9]*))?\)").unwrap();

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    // CAMBIO TAURI 2: Convertir Vec<u8> a String
                    let line_str = String::from_utf8_lossy(&line);
                    app_handle.emit("scan_completed", line_str.to_string()).ok();
                }
                CommandEvent::Stderr(msg) => {
                    // CAMBIO TAURI 2: Convertir Vec<u8> a String antes de pasar al Regex
                    let msg_str = String::from_utf8_lossy(&msg);
                    let caps = re.captures(&msg_str);
                    
                    if let Some(groups) = caps {
                        if groups.len() > 2 {
                            emit_scan_status(&app_handle, groups)
                        }
                    }
                }
                CommandEvent::Terminated(t) => {
                    println!("{t:?}");
                }
                _ => {}
            };
        }
        Result::<(), ()>::Ok(())
    });

    Ok(())
}

pub fn stop(state: tauri::State<'_, MyState>) {
    state
        .0
        .lock()
        .unwrap()
        .take()
        .unwrap()
        .kill()
        .expect("State is None");
}

fn emit_scan_status(app_handle: &tauri::AppHandle, groups: Captures) {
    app_handle
        .emit(
            "scan_status",
            Payload {
                items: groups
                    .get(1)
                    .map_or("0", |m| m.as_str())
                    .trim_end()
                    .parse::<u64>()
                    .unwrap(),
                total: groups
                    .get(2)
                    .map_or("0", |m| m.as_str())
                    .trim_end()
                    .parse::<u64>()
                    .unwrap(),
                errors: groups
                    .get(3)
                    .map_or("0", |m| m.as_str())
                    .trim_end()
                    .parse::<u64>()
                    .unwrap(),
            },
        )
        .unwrap();
} 