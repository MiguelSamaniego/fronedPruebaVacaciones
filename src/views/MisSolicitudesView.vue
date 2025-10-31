<template>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Mis solicitudes</h2>
      <div class="flex gap-2 items-center">
        <label class="text-sm text-slate-700">Empleado ID:</label>
        <input v-model.number="empleadoId" type="number" class="border rounded px-2 py-1 w-24" />
        <button @click="cargar" class="bg-slate-900 text-white px-3 py-1 rounded text-sm">Cargar</button>
      </div>
    </div>

    <table class="w-full text-sm">
      <thead>
        <tr class="text-left border-b">
          <th class="py-2">ID</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Días</th>
          <th>Estado</th>
          <th>Obs.</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in solicitudes" :key="s.id" class="border-b">
          <td class="py-2">{{ s.id }}</td>
          <td>{{ s.fechaInicio }}</td>
          <td>{{ s.fechaFin }}</td>
          <td>{{ s.diasSolicitados }}</td>
          <td>
            <span :class="estadoClass(s.estado)">{{ s.estado }}</span>
          </td>
          <td>{{ s.observacion || "—" }}</td>
        </tr>
        <tr v-if="solicitudes.length === 0">
          <td colspan="6" class="text-slate-400 py-3 text-center">Sin datos</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";

const empleadoId = ref(1);
const solicitudes = ref([]);

const cargar = async () => {
  try {
    const { data } = await axios.get(`/api/vacaciones/empleado/${empleadoId.value}`);
    solicitudes.value = data;
  } catch (e) {
    console.error(e);
  }
};

const estadoClass = (estado) => {
  if (estado === "APROBADA") return "text-emerald-600 font-medium";
  if (estado === "RECHAZADA") return "text-red-500 font-medium";
  return "text-amber-500 font-medium";
};

onMounted(cargar);
</script>
