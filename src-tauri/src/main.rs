// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::AppHandle;
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

async fn run_python_command(app: AppHandle, args: Vec<String>) -> Result<String, String> {
    #[cfg(debug_assertions)]
    let command_name = "python";
    #[cfg(debug_assertions)]
    let script_path = "python/main.py";

    #[cfg(not(debug_assertions))]
    let command_name = "python/python_backend.exe";

    let mut command_builder = app.shell().command(command_name);

    #[cfg(debug_assertions)]
    {
        command_builder = command_builder.arg(script_path);
    }

    let (mut rx, _child) = command_builder
        .args(&args)
        .spawn()
        .map_err(|e| format!("Fallo al ejecutar el script: {}", e))?;

    let mut stdout_buffer = String::new();
    let mut stderr_buffer = String::new();

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(bytes) => stdout_buffer.push_str(&String::from_utf8_lossy(&bytes)),
            CommandEvent::Stderr(bytes) => stderr_buffer.push_str(&String::from_utf8_lossy(&bytes)),
            CommandEvent::Terminated(payload) => {
                if payload.code != Some(0) {
                    return Err(format!("El script de Python falló. Detalles: {}", stderr_buffer));
                }
            }
            _ => (),
        }
    }

    if !stderr_buffer.is_empty() && stdout_buffer.is_empty() {
        return Err(stderr_buffer);
    }

    Ok(stdout_buffer)
}

// --- COMANDO PREVIEW CORREGIDO ---
// 1. AÑADIMOS #[tauri::command(rename_all = "camelCase")]
//    Esto le dice a Tauri que espere argumentos en camelCase desde el frontend.
#[tauri::command(rename_all = "camelCase")]
async fn preview_task(app: tauri::AppHandle, cronograma_path: String, ip_filter: String) -> Result<String, String> {
    let args = vec![
        "--mode".to_string(), "preview".to_string(),
        "--cronograma-path".to_string(), cronograma_path,
        "--ip-filter".to_string(), ip_filter,
    ];
    run_python_command(app, args).await
}

// --- COMANDO EXPORT CORREGIDO ---
#[tauri::command(rename_all = "camelCase")]
async fn export_task(app: tauri::AppHandle, cronograma_path: String, ip_filter: String, output_path: String) -> Result<String, String> {
    let args = vec![
        "--mode".to_string(), "export".to_string(),
        "--cronograma-path".to_string(), cronograma_path,
        "--ip-filter".to_string(), ip_filter,
        "--output-path".to_string(), output_path,
    ];
    run_python_command(app, args).await
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![preview_task, export_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}