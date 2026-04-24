# SQDisk

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

## ¿Qué está ocupando tu espacio en disco?

**SQDisk** es un **fork** del proyecto original SquirrelDisk, optimizado y actualizado para ofrecer una experiencia moderna. Es la herramienta de código abierto más intuitiva para localizar archivos de gran tamaño que consumen tu almacenamiento.

Es una alternativa eficiente y ligera a softwares como WinDirStat, WizTree, TreeSize y DaisyDisk.

### 🚀 Novedades en SQDisk
* **Migración a Tauri 2.0**: Actualización completa del framework para aprovechar las últimas mejoras en seguridad y rendimiento.
* **Cronómetro de Escaneo**: Se ha añadido un timer en tiempo real para monitorear el progreso y la duración del análisis, para verificar el timepo y que el usuario note que la UI no se ha congelado.
* **Soporte Multiidioma**: La aplicación ahora es totalmente internacional, permitiendo su uso en diversos idiomas.
* **Base Modernizada**: Mantenemos las mejores funciones del original bajo una arquitectura más actual.

### Características
- Escaneo rápido de unidades completas o directorios específicos.
- **Gráfico Sunburst**: Visualiza de forma jerárquica y colorida qué carpetas ocupan más espacio.
- Detección automática de discos externos.
- **Drag and Drop**: Arrastra archivos y carpetas a una zona de recolección para eliminarlos masivamente.
- Acceso directo al explorador de archivos desde la app.
- Multiplataforma (Windows, macOS, Linux).

---
> [!CAUTION]
>## 🛠 Estado del Proyecto y Bugs Conocidos
Esta versión se encuentra en desarrollo activo.
* **UI Lag/Freeze**: Se ha identificado un ligero congelamiento de la interfaz durante el **escaneo profundo (slow scan)**. Estamos trabajando en mejorar el manejo de hilos en Rust para solucionar este comportamiento.

---

> [!IMPORTANT]  
>### Windows
1. Al no estar firmado digitalmente, Windows puede mostrar una advertencia. Haz clic en "Más información" y luego en "Ejecutar de todas formas".

>### Ubuntu / Linux
1. Instálalo mediante la terminal o tu centro de software.

>### MacOS
1. Para la primera ejecución: **Clic derecho > Abrir**. Si aparece un aviso de seguridad, ciérralo y repite **Clic derecho > Abrir**. Esto solo es necesario la primera vez.

> [!WARNING] 
> Aun no testeado en Mac/Linux

---

## Créditos
* **SquirrelDisk**: Proyecto base original.
* **Tauri Framework**: Motor de la aplicación.
* React

---