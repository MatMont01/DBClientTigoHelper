// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_shell::{process::CommandEvent, ShellExt};

async fn run_python_command(app: tauri::AppHandle, args: Vec<&str>) -> Result<String, String> {
    // En la versión final, siempre usaremos el ejecutable empaquetado.
    let command_name = "python/python_backend.exe";

    // Hemos eliminado la variable 'mut' innecesaria.
    let (mut rx, _child) = app.shell()
        .command(command_name)
        .args(args)
        .spawn()
        .map_err(|e| e.to_string())?;

    let mut stdout_buffer = String::new();
    let mut stderr_buffer = String::new();

    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(bytes) => {
                let line = String::from_utf8_lossy(&bytes);
                print!("PY_STDOUT: {}", line);
                stdout_buffer.push_str(&line);
            }
            CommandEvent::Stderr(bytes) => {
                let line = String::from_utf8_lossy(&bytes);
                eprint!("PY_STDERR: {}", line);
                stderr_buffer.push_str(&line);
            }
            CommandEvent::Terminated(payload) => {
                if payload.code != Some(0) {
                    return Err(format!("El script de Python falló con código {:?}. Detalles:\n{}", payload.code, stderr_buffer));
                }
            }
            _ => (),
        }
    }

    if stdout_buffer.is_empty() && !stderr_buffer.is_empty() {
        return Err(stderr_buffer);
    }

    Ok(stdout_buffer)
}

#[tauri::command]
async fn preview_task(app: tauri::AppHandle) -> Result<String, String> {
    run_python_command(app, vec!["--mode", "preview"]).await
}

#[tauri::command]
async fn export_task(app: tauri::AppHandle, output_path: String) -> Result<String, String> {
    run_python_command(app, vec!["--mode", "export", "--output-path", &output_path]).await
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![preview_task, export_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}