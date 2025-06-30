// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, command, Manager};
use tauri::path::BaseDirectory;

#[command]
fn run_automation_task(app: AppHandle, task_name: String, params_json: String) -> Result<String, String> {
    let script_path = app
        .path()
        .resolve("python/task_runner.py", BaseDirectory::Resource)
        .map_err(|e| format!("Error resolviendo ruta del script: {e}"))?;

    let mut cmd = std::process::Command::new("python");
    cmd.arg(script_path)
        .arg(task_name)
        .arg(params_json);

    // SOLO EN WINDOWS: Ocultar la consola de Python
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    let output = cmd
        .output()
        .map_err(|e| format!("Failed to run Python script: {:?}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Python error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![run_automation_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
