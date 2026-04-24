// Copyright 2020-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! Add native shadows to your windows (y estilos de borde en Windows 11).

/// Enables or disables the shadows for a window.
pub fn set_window_styles(window: impl raw_window_handle::HasWindowHandle) -> Result<(), Error> {
    let handle = window.window_handle().map_err(|_| Error::UnsupportedPlatform)?;

    match handle.as_raw() {
        #[cfg(target_os = "macos")]
        raw_window_handle::RawWindowHandle::AppKit(handle) => {
            use cocoa::{appkit::NSWindow, base::id};
            use objc::{msg_send, runtime::YES};

            unsafe {
                let ns_view = handle.ns_view.as_ptr() as id;
                let window: id = msg_send![ns_view, window];
                window.setHasShadow_(YES);
            }

            Ok(())
        }
        #[cfg(target_os = "windows")]
        raw_window_handle::RawWindowHandle::Win32(handle) => {
            use windows_sys::Win32::{
                Foundation::COLORREF, Graphics::Dwm::DwmSetWindowAttribute,
                Graphics::Dwm::DWMWA_BORDER_COLOR, Graphics::Dwm::DWMWA_WINDOW_CORNER_PREFERENCE,
                Graphics::Dwm::DWMWCP_ROUND,
            };

            unsafe {
                // CAMBIO: Usar .get() para extraer el isize del NonZero
                let hwnd = handle.hwnd.get() as _;

                DwmSetWindowAttribute(
                    hwnd,
                    DWMWA_WINDOW_CORNER_PREFERENCE as u32,
                    &DWMWCP_ROUND as *const i32 as *const _,
                    std::mem::size_of::<i32>() as _,
                );

                let dark_color: COLORREF = 0x280606;
                DwmSetWindowAttribute(
                    hwnd,
                    DWMWA_BORDER_COLOR as u32,
                    &dark_color as *const COLORREF as *const _,
                    std::mem::size_of::<COLORREF>() as _,
                );
            };
            Ok(())
        }
        _ => Err(Error::UnsupportedPlatform),
    }
}

#[derive(Debug)]
pub enum Error {
    UnsupportedPlatform,
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "\"set_shadow()\" is only supported on Windows and macOS")
    }
}