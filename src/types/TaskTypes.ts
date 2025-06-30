// Tarea base para la UI, pensada para escalar a muchas automatizaciones
export type AutomationTaskMeta = {
  key: string;                  // nombre interno (ej: 'clients_by_node')
  displayName: string;          // nombre visible
  description: string;          // descripción
  image?: string;               // imagen asociada (assets)
};

export type AutomationTaskList = AutomationTaskMeta[];

// Para el resultado/preview de la tarea "clients_by_node"
export type ClientsByNodeResult = {
  "FECHA TRABAJO": string;
  "NODO_N": string;
  "DEPARTAMENTO": string;
  "CLIENTENRO": string;
  "CLIENTE_NOMBRE_COMPLETO": string;
  "PRODUCTO_IP": string;
  "CLIENTE_TELEFONO": string;
  "ES_B2B": string;
  // Si agregas campos extra en el futuro, agrégalos aquí
};

// Parámetros genéricos para cualquier tarea
export type AutomationTaskParams = {
  [key: string]: any;
};

// Preview genérico (puede ser array de cualquier objeto según la tarea)
export type AutomationTaskPreview = any[];
