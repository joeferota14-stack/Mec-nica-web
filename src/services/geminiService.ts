import { GoogleGenAI } from '@google/genai';
import { Vehicle, WorkOrder, AIMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Genera el prompt del sistema para el asistente de diagnóstico
function buildSystemPrompt(vehicle?: Vehicle, orders?: WorkOrder[]): string {
  let prompt = `Eres un técnico mecánico experto de WLAS MOTOR, un taller automotriz de alta precisión en México.
Tu rol es asistir a los técnicos del taller con diagnósticos, recomendaciones de mantenimiento y consultas técnicas.
Responde siempre en español, de forma clara, técnica y concisa.
Usa listas cuando sea apropiado. Sé directo y práctico.`;

  if (vehicle) {
    prompt += `\n\nCONTEXTO DEL VEHÍCULO ACTUAL:
- Marca/Modelo/Año: ${vehicle.brand} ${vehicle.model} ${vehicle.year}
- Kilometraje: ${vehicle.mileage.toLocaleString()} km
- Combustible: ${vehicle.fuelType}
- Transmisión: ${vehicle.transmission}`;

    if (orders && orders.length > 0) {
      const recent = orders.slice(-3);
      prompt += `\n\nÚLTIMAS ${recent.length} ÓRDENES DE ESTE VEHÍCULO:`;
      recent.forEach(o => {
        prompt += `\n- ${o.createdAt.split('T')[0]}: ${o.description} (${o.status})`;
        if (o.diagnosis) prompt += ` — Diagnóstico: ${o.diagnosis}`;
      });
    }
  }

  return prompt;
}

// Función principal de chat
export async function sendMessage(params: {
  userMessage: string;
  chatHistory: AIMessage[];
  vehicle?: Vehicle;
  orders?: WorkOrder[];
}): Promise<string> {
  const { userMessage, chatHistory, vehicle, orders } = params;

  const systemPrompt = buildSystemPrompt(vehicle, orders);

  // Construye el historial en formato Gemini
  const history = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }],
  }));

  const chat = ai.chats.create({
    model: 'gemini-2.0-flash',
    config: { systemInstruction: systemPrompt },
    history,
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text ?? '';
}

// Sugerencias de diagnóstico rápido
export async function quickDiagnosis(symptoms: string, vehicle: Vehicle): Promise<string> {
  const prompt = `Vehículo: ${vehicle.brand} ${vehicle.model} ${vehicle.year} (${vehicle.mileage} km, ${vehicle.fuelType})
Síntomas reportados: ${symptoms}

Proporciona un diagnóstico preliminar con:
1. Posibles causas (de más a menos probable)
2. Diagnóstico recomendado
3. Urgencia (inmediata / puede esperar / mantenimiento preventivo)
4. Estimado de costo aproximado en dólares (USD)`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  return response.text ?? '';
}
