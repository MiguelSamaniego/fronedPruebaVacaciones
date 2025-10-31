<template>
  <div class="max-w-xl bg-white rounded-xl shadow p-5">
    <h2 class="text-lg font-semibold mb-1">Solicitud de vacaciones</h2>
    <p class="text-slate-500 text-sm mb-4">
      Enviará una solicitud al backend de Spring Boot.
    </p>

    <form @submit.prevent="enviar">
      <div class="mb-3">
        <label class="block text-sm text-slate-700 mb-1">Empleado ID</label>
        <input v-model.number="form.empleadoId" type="number" class="border rounded px-3 py-2 w-full" />
      </div>
      <div class="mb-3">
        <label class="block text-sm text-slate-700 mb-1">Empleado nombre</label>
        <input v-model="form.empleadoNombre" type="text" class="border rounded px-3 py-2 w-full" />
      </div>
      <div class="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm text-slate-700 mb-1">Fecha inicio</label>
          <input v-model="form.fechaInicio" type="date" class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-sm text-slate-700 mb-1">Fecha fin</label>
          <input v-model="form.fechaFin" type="date" class="border rounded px-3 py-2 w-full" />
        </div>
      </div>
      <div class="mb-3">
        <label class="block text-sm text-slate-700 mb-1">Días solicitados</label>
        <input v-model.number="form.diasSolicitados" type="number" min="1" class="border rounded px-3 py-2 w-full" />
      </div>
      <button :disabled="cargando" class="bg-slate-900 text-white px-4 py-2 rounded">
        {{ cargando ? "Enviando..." : "Enviar solicitud" }}
      </button>
      <p v-if="mensaje" class="mt-3 text-sm" :class="error ? 'text-red-500' : 'text-emerald-600'">
        {{ mensaje }}
      </p>
    </form>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";

const form = ref({
  empleadoId: 1,
  empleadoNombre: "Juan Pérez",
  fechaInicio: "",
  fechaFin: "",
  diasSolicitados: 1
});

const cargando = ref(false);
const mensaje = ref("");
const error = ref(false);

const enviar = async () => {
  cargando.value = true;
  mensaje.value = "";
  error.value = false;
  try {
    const { data } = await axios.post("/api/vacaciones/empleado", form.value);
    mensaje.value = `Solicitud creada con ID ${data.id}`;
  } catch (e) {
    error.value = true;
    mensaje.value = "Error al enviar la solicitud";
    console.error(e);
  } finally {
    cargando.value = false;
  }
};
</script>
