// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 1. LIMPIEZA DE IMPORTACIONES: Se eliminó 'Manager' que no se usaba.
use tauri::AppHandle;
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

// Función centralizada para ejecutar cualquier comando de Python
async fn run_python_command(app: AppHandle, args: Vec<String>) -> Result<String, String> {
    // Lógica para usar el ejecutable en producción o el script en desarrollo
    #[cfg(not(debug_assertions))]
    let command_name = "python/python_backend.exe";
    #[cfg(debug_assertions)]
    let command_name = "python";

    println!("Ejecutando comando: {} con args: {:?}", command_name, &args);

    let mut command_builder = app.shell().command(command_name);

    #[cfg(debug_assertions)]
    {
        command_builder = command_builder.arg("python/main.py");
    }

    let (mut rx, _child) = command_builder
        .args(&args)
        .spawn()
        .map_err(|e| format!("Fallo al ejecutar el script: {}", e))?;

    let mut stdout_buffer = String::new();
    let mut stderr_buffer = String::new();

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(bytes) => {
                stdout_buffer.push_str(&String::from_utf8_lossy(&bytes));
            }
            CommandEvent::Stderr(bytes) => {
                let line = String::from_utf8_lossy(&bytes);
                eprintln!("PY_STDERR: {}", line);
                stderr_buffer.push_str(&line);
            }
            CommandEvent::Terminated(payload) => {
                if payload.code != Some(0) {
                    return Err(format!("El script de Python falló con código {:?}. Detalles: {}", payload.code, stderr_buffer));
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

// --- 2. COMANDO PREVIEW SIMPLIFICADO ---
// Se eliminó b2b_filter de la firma y de los argumentos
#[tauri::command]
async fn preview_task(app: tauri::AppHandle, cronograma_path: String) -> Result<String, String> {
    let args = vec![
        "--mode".to_string(), "preview".to_string(),
        "--cronograma-path".to_string(), cronograma_path,
    ];
    run_python_command(app, args).await
}

// --- 3. COMANDO EXPORT SIMPLIFICADO ---
// Se eliminó b2b_filter de la firma y de los argumentos
#[tauri::command]
async fn export_task(app: tauri::AppHandle, cronograma_path: String, output_path: String) -> Result<String, String> {
    let args = vec![
        "--mode".to_string(), "export".to_string(),
        "--cronograma-path".to_string(), cronograma_path,
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