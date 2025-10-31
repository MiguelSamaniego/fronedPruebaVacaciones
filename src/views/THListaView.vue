<template>
  <div class="bg-white rounded-xl shadow p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Todas las solicitudes (TH)</h2>
      <button @click="cargar" class="bg-slate-900 text-white px-3 py-1 rounded text-sm">Refrescar</button>
    </div>

    <div class="grid md:grid-cols-3 gap-4 mb-4" v-if="seleccion">
      <div>
        <label class="text-sm text-slate-600">Empleado</label>
        <div class="text-sm font-medium">{{ seleccion.empleadoNombre }} (ID {{ seleccion.empleadoId }})</div>
      </div>
      <div>
        <label class="text-sm text-slate-600">Rango</label>
        <div class="text-sm">{{ seleccion.fechaInicio }} → {{ seleccion.fechaFin }}</div>
      </div>
      <div>
        <label class="text-sm text-slate-600">Días</label>
        <div class="text-sm">{{ seleccion.diasSolicitados }}</div>
      </div>

      <div class="md:col-span-3 flex gap-2 items-center">
        <input v-model="obs" type="text" placeholder="Observación..." class="border rounded px-3 py-1 flex-1" />
        <button @click="decidir(true)" class="bg-emerald-600 text-white px-3 py-1 rounded text-sm">Aprobar</button>
        <button @click="decidir(false)" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Rechazar</button>
      </div>
    </div>

    <table class="w-full text-sm">
      <thead>
        <tr class="text-left border-b">
          <th class="py-2">ID</th>
          <th>Empleado</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Días</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in solicitudes" :key="s.id" class="border-b hover:bg-slate-50 cursor-pointer" @click="select(s)">
          <td class="py-2">{{ s.id }}</td>
          <td>{{ s.empleadoNombre || "—" }}</td>
          <td>{{ s.fechaInicio }}</td>
          <td>{{ s.fechaFin }}</td>
          <td>{{ s.diasSolicitados }}</td>
          <td>
            <span :class="estadoClass(s.estado)">{{ s.estado }}</span>
          </td>
        </tr>
        <tr v-if="solicitudes.length === 0">
          <td colspan="6" class="text-slate-400 py-3 text-center">No hay solicitudes</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";

const solicitudes = ref([]);
const seleccion = ref(null);
const obs = ref("");

const cargar = async () => {
  try {
    const { data } = await axios.get("/api/vacaciones/th");
    solicitudes.value = data;
  } catch (e) {
    console.error(e);
  }
};

const select = (s) => {
  seleccion.value = { ...s };
  obs.value = s.observacion || "";
};

const decidir = async (aprobar) => {
  if (!seleccion.value) return;
  try {
    await axios.put(`/api/vacaciones/th/${seleccion.value.id}/decision`, {
      fechaInicio: seleccion.value.fechaInicio,
      fechaFin: seleccion.value.fechaFin,
      diasSolicitados: seleccion.value.diasSolicitados,
      observacion: obs.value,
      aprobadoPor: 999,
      aprobar
    });
    await cargar();
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
