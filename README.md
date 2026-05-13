# SQDisk

<h2 align="center">
  <a href="https://github.com/Roberto-deP-Martins/squirreldisk/blob/main/README-ES.md">Spanish Version</a>
</h3>

<br>

<p align="center">
    <img src="https://img.shields.io/badge/built_with-Rust-dca282.svg?style=flat-square">
    &nbsp;
    <img src="https://img.shields.io/badge/Tauri-2.0-blue?style=flat-square&logo=tauri">
</p>

<div align="center">

[![Windows Support](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/adileo/squirreldisk/releases) [![Ubuntu Support](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)](https://github.com/adileo/squirreldisk/releases) [![Windows Support](https://img.shields.io/badge/MACOS-adb8c5?style=for-the-badge&logo=macos&logoColor=white)](https://github.com/adileo/squirreldisk/releases)

</div>

![Screenshot](/public/squirrel-demo-2.gif)

</div>

## What's taking your hard disk space?

**SQDisk** is a **fork** of the original SquirrelDisk project, optimized and updated to offer a modern experience. It is the most intuitive open source tool for locating big files that take up your storage.

SQDisk is an open source alternative to softwares like: WinDirStat, WizTree, TreeSize and DaisyDisk.

### 🚀 Newly added in SQDisk
* **Migration to Tauri 2.0**: Complete framework update to take advantage of the latest security and performance improvements.
* **Scan Cronometer**: A timer has been added to monitor the progress and duration of the scan. This allows the user to be sure that the UI has not frozen.
* **Multi-language support**: The application is now totally international, allowing it to be used in many languages.
* **Modernized bases**: We kept the best features of the original with a more up-to-date architecture.

### Features
- Quick scan of entire disks or specific directories.
- **Sunburst Graph**: Visualize in a quick and beautiful way which directories take the most space.
- Automatic detection of external drives.
- **Drag and Drop**: Drag and drog directories and files into a removal zone to delete them all at once.
- Direct access to the file browser from the app.
- Multiplatform (Windows, macOS, Linux).

---
> [!CAUTION]
>## 🛠 Project State and Known Bugs
This version is in active development.
* **UI Lag/Freeze**: A small interface freezes has been found during **deep scan**. We are working in improving the thread management in Rust to solve this behaviour.

---

> [!IMPORTANT]  
>### Windows
1. Since the app is not digitally signed, Windows may show a warning. To bypass it, click in "More info" and then "Run Anyway".

>### Ubuntu / Linux
1. Install directly from the terminal or your software center.

>### MacOS
1. First time you open the App: Right click > Open once (it won't run, since the binaries are not signed an alert will appear), then do it again Right click > Open to bypass the issue, it won't happen again after the first time.

> [!WARNING] 
> Yet to be tested on Mac
---

## Créditos
* **SquirrelDisk**: Original base project.
* **Tauri Framework**: App engine.
* React

---
