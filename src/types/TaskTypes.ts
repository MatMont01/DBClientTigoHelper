// src/types/TaskTypes.ts

export interface AutomationTask {
  key: string;
  displayName: string;
  description: string;
}

export interface AutomationTaskParams {
  outputPath: string;
}

export interface AutomationTaskPreview {
  message: string;
  filePath?: string;
}