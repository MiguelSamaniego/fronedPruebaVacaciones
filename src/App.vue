<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
    <main class="max-w-6xl mx-auto">

      <!-- ======== LOGIN / REGISTRO ======== -->
      <section v-if="!user" class="max-w-md mx-auto card">
        <!-- LOGIN -->
        <template v-if="!showingRegister">
          <h1 class="text-xl font-semibold mb-2">Iniciar sesión</h1>
          <p class="text-sm text-gray-500 mb-4">
            Usa: <code>empleado1 / 1234</code> o <code>th1 / 1234</code>.
          </p>
          <form class="grid gap-3" @submit.prevent="doLogin">
            <div>
              <label class="label">Usuario</label>
              <input v-model="loginForm.username" type="text" class="input w-full" autocomplete="username" />
            </div>
            <div>
              <label class="label">Contraseña</label>
              <input v-model="loginForm.password" type="password" class="input w-full" autocomplete="current-password" />
            </div>
            <button type="submit" class="btn btn-blue" :disabled="loggingIn">
              {{ loggingIn ? 'Ingresando...' : 'Entrar' }}
            </button>
            <p v-if="loginError" class="text-sm text-red-600">{{ loginError }}</p>
          </form>
          <p class="mt-4 text-sm text-gray-600">
            ¿No tienes cuenta?
            <button class="text-blue-600 underline" @click="showingRegister = true">
              Crear nueva
            </button>
          </p>
        </template>

        <!-- REGISTRO -->
        <template v-else>
          <h1 class="text-xl font-semibold mb-2">Registrar nuevo usuario</h1>
          <p class="text-sm text-gray-500 mb-4">
            Crea un empleado o un usuario de Talento Humano.
          </p>
          <form class="grid gap-3" @submit.prevent="doRegister">
            <div>
              <label class="label">Nombre completo</label>
              <input v-model="registerForm.nombre" type="text" class="input w-full" required />
            </div>
            <div>
              <label class="label">Usuario</label>
              <input v-model="registerForm.username" type="text" class="input w-full" required />
            </div>
            <div>
              <label class="label">Contraseña</label>
              <input v-model="registerForm.password" type="password" class="input w-full" required />
            </div>
            <div>
              <label class="label">Rol</label>
              <select v-model="registerForm.rol" class="input w-full">
                <option value="EMPLOYEE">Empleado</option>
                <option value="TH">Talento Humano</option>
              </select>
            </div>
            <button type="submit" class="btn btn-blue" :disabled="registering">
              {{ registering ? 'Creando...' : 'Registrar' }}
            </button>
            <p v-if="registerError" class="text-sm text-red-600">{{ registerError }}</p>
          </form>
          <p class="mt-4 text-sm text-gray-600">
            ¿Ya tienes cuenta?
            <button class="text-blue-600 underline" @click="showingRegister = false">
              Volver a iniciar sesión
            </button>
          </p>
        </template>
      </section>

      <!-- ======== APP ======== -->
      <section v-else>
        <header class="mb-4 flex items-center justify-between">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold mb-1">Sistema de Vacaciones</h1>
            <p class="text-sm text-gray-600">
              Hola {{ user.nombre }} ({{ user.rol }})
            </p>
          </div>
          <button class="text-sm text-red-500" @click="logout">Cerrar sesión</button>
        </header>

        <!-- Tabs -->
        <nav class="tabs flex gap-2 border-b mb-6" role="tablist">
          <!-- EMPLEADO -->
          <button
            v-if="isEmployee"
            class="px-3 py-2 text-sm rounded-t-lg"
            :aria-selected="tab === 'solicitud'"
            @click="tab = 'solicitud'"
          >
            1) Solicitud (Empleado)
          </button>
          <button
            v-if="isEmployee"
            class="px-3 py-2 text-sm rounded-t-lg"
            :aria-selected="tab === 'mis'"
            @click="cargarMis(); tab = 'mis'"
          >
            2) Mis solicitudes
          </button>

          <!-- TH -->
          <button
            v-if="isTH"
            class="px-3 py-2 text-sm rounded-t-lg"
            :aria-selected="tab === 'lista'"
            @click="cargarTH(); tab = 'lista'"
          >
            3) Lista (Talento Humano)
          </button>
          <button
            v-if="isTH"
            class="px-3 py-2 text-sm rounded-t-lg"
            :aria-selected="tab === 'aprobacion'"
            @click="tab = 'aprobacion'"
          >
            4) Aprobación (TH)
          </button>
        </nav>

        <!-- 1) Solicitud -->
        <section v-if="tab === 'solicitud' && (isEmployee || isTH)" class="card grid gap-4" data-view>
          <div class="flex items-start justify-between mb-2">
            <div>
              <h2 class="text-lg font-semibold">Solicitud de vacaciones</h2>
              <p class="text-sm text-gray-500">La validación/reglas las agregas tú.</p>
            </div>
            <span class="badge badge-blue">Empleado</span>
          </div>

          <form class="grid md:grid-cols-2 gap-4" @submit.prevent="enviarSolicitud">
            <div class="col-span-2 grid md:grid-cols-3 gap-4">
              <div class="flex flex-col">
                <span class="label">Fecha de ingreso</span>
                <input
                  type="date"
                  class="input"
                  v-model="fechaIngreso"
                  @change="calcularAniosServicio"
                />
              </div>
              <div class="flex items-end gap-6">
                <div>
                  <div class="text-sm text-gray-600">Años de servicio</div>
                  <div class="text-xl font-semibold">{{ aniosServicio ?? '—' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600">Días disponibles</div>
                  <div class="text-xl font-semibold">
                    {{ diasDisponibles }}
                  </div>
                </div>
              </div>
            </div>

            <label class="flex flex-col">
              <span class="label">Fecha inicio</span>
              <input
                type="date"
                class="input"
                v-model="form.fechaInicio"
                @change="calcularDiasSolicitados"
              />
            </label>
            <label class="flex flex-col">
              <span class="label">Fecha fin</span>
              <input
                type="date"
                class="input"
                v-model="form.fechaFin"
                @change="calcularDiasSolicitados"
              />
            </label>

            <div class="col-span-2 flex items-center gap-4">
              <div class="text-sm">
                Días solicitados:
                <b>{{ form.diasSolicitados || '—' }}</b>
              </div>
              <div v-if="errorDias" class="text-sm text-red-600">
                {{ errorDias }}
              </div>
            </div>

            <div class="col-span-2 flex gap-2 items-center">
              <button type="submit" class="btn btn-blue" :disabled="cargando || !!errorDias">
                {{ cargando ? 'Enviando...' : 'Registrar solicitud' }}
              </button>
              <span class="text-sm" :class="envioOk ? 'text-emerald-600' : 'text-gray-700'">
                {{ mensaje }}
              </span>
            </div>
          </form>
        </section>

        <!-- 2) Mis solicitudes -->
        <section v-if="tab === 'mis' && isEmployee" class="card mt-6" data-view>
          <div class="flex items-start justify-between mb-2">
            <div>
              <h2 class="text-lg font-semibold">Mis solicitudes</h2>
              <p class="text-sm text-gray-500">Consulta el estado de cada solicitud</p>
            </div>
            <span class="badge badge-blue">Empleado</span>
          </div>

          <div class="overflow-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-600 border-b">
                  <th class="py-2">#</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Días</th>
                  <th>Estado</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in misSolicitudes" :key="s.id" class="border-b">
                  <td class="py-2">{{ s.id }}</td>
                  <td>{{ s.fechaInicio }}</td>
                  <td>{{ s.fechaFin }}</td>
                  <td>{{ s.diasSolicitados }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'badge-green': s.estado === 'APROBADA',
                        'badge-red': s.estado === 'RECHAZADA',
                        'badge-amber': s.estado === 'PENDIENTE'
                      }"
                    >
                      {{ s.estado?.toLowerCase() }}
                    </span>
                  </td>
                  <td class="text-gray-600">{{ s.observacion || '—' }}</td>
                </tr>
                <tr v-if="misSolicitudes.length === 0">
                  <td colspan="6" class="py-3 text-center text-gray-400">Sin solicitudes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 3) Lista global TH -->
        <section v-if="tab === 'lista' && isTH" class="card mt-6" data-view>
          <div class="flex items-start justify-between mb-2">
            <div>
              <h2 class="text-lg font-semibold">Solicitudes de empleados</h2>
              <p class="text-sm text-gray-500">Vista de Talento Humano</p>
            </div>
            <span class="badge badge-purple">Talento Humano</span>
          </div>

          <div class="flex items-center gap-2 mb-3">
            <input class="input w-full md:w-80" placeholder="Buscar por empleado, # o estado" v-model="filtro" />
            <button class="btn btn-blue" @click="cargarTH">Refrescar</button>
          </div>

          <div class="overflow-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-gray-600 border-b">
                  <th class="py-2">ID</th>
                  <th>Empleado</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Días</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="s in solicitudesFiltradas"
                  :key="s.id"
                  class="border-b hover:bg-gray-50 cursor-pointer"
                  @click="seleccionarParaAprobacion(s)"
                >
                  <td class="py-2">{{ s.id }}</td>
                  <td>{{ s.empleadoNombre || '—' }}</td>
                  <td>{{ s.fechaInicio }}</td>
                  <td>{{ s.fechaFin }}</td>
                  <td>{{ s.diasSolicitados }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'badge-green': s.estado === 'APROBADA',
                        'badge-red': s.estado === 'RECHAZADA',
                        'badge-amber': s.estado === 'PENDIENTE'
                      }"
                    >
                      {{ s.estado?.toLowerCase() }}
                    </span>
                  </td>
                  <td class="text-blue-600 text-xs">Ver / aprobar</td>
                </tr>
                <tr v-if="solicitudesTH.length === 0">
                  <td colspan="7" class="py-3 text-center text-gray-400">Sin datos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 4) Aprobación -->
        <section v-if="tab === 'aprobacion' && isTH" class="card mt-6" data-view>
          <div class="flex items-start justify-between mb-2">
            <div>
              <h2 class="text-lg font-semibold">Aprobación de solicitudes</h2>
              <p class="text-sm text-gray-500">Aprobar con o sin cambios, o negar</p>
            </div>
            <span class="badge badge-purple">Talento Humano</span>
          </div>

          <div class="text-sm text-gray-700 mb-4">
            <template v-if="seleccionada">
              Solicitud #{{ seleccionada.id }} — {{ seleccionada.empleadoNombre || '—' }}
            </template>
            <template v-else>
              Selecciona una solicitud en la pestaña 3)
            </template>
          </div>

          <div class="grid md:grid-cols-2 gap-4" v-if="seleccionada">
            <label class="flex flex-col">
              <span class="label">Fecha inicio</span>
              <input type="date" class="input" v-model="seleccionada.fechaInicio" />
            </label>
            <label class="flex flex-col">
              <span class="label">Fecha fin</span>
              <input type="date" class="input" v-model="seleccionada.fechaFin" />
            </label>
            <div class="md:col-span-2 flex items-center gap-4">
              <div class="text-sm">Días calculados: <b>{{ seleccionada.diasSolicitados || '—' }}</b></div>
            </div>
            <label class="md:col-span-2 flex flex-col">
              <span class="label">Observación (opcional)</span>
              <textarea class="input" rows="3" v-model="obs"></textarea>
            </label>
            <div class="md:col-span-2 flex flex-wrap gap-2">
              <button type="button" class="btn btn-green" @click="decidir(true)">Aprobar</button>
              <button type="button" class="btn btn-red" @click="decidir(false)">Negar</button>
            </div>
          </div>
        </section>
      </section>

      <footer class="mt-8 text-xs text-gray-500 text-center">
        * Vue consumiendo tu backend (http://localhost:8080).
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

/* ====== AUTH STATE ====== */
const user = ref(null);
const showingRegister = ref(false);

const loginForm = ref({
  username: "",
  password: "",
});
const loggingIn = ref(false);
const loginError = ref("");

const registerForm = ref({
  nombre: "",
  username: "",
  password: "",
  rol: "EMPLOYEE",
});
const registering = ref(false);
const registerError = ref("");

/* ====== UI STATE ====== */
const tab = ref("solicitud");

/* ====== SOLICITUD STATE ====== */
const fechaIngreso = ref("2022-07-01");
const aniosServicio = ref(null);
const diasDisponibles = ref(0);

const form = ref({
  empleadoId: null,
  empleadoNombre: "",
  fechaInicio: "",
  fechaFin: "",
  diasSolicitados: null,
});

const cargando = ref(false);
const mensaje = ref("");
const envioOk = ref(false);
const errorDias = ref("");

/* ====== LISTAS ====== */
const misSolicitudes = ref([]);
const solicitudesTH = ref([]);
const filtro = ref("");
const seleccionada = ref(null);
const obs = ref("");

/* ====== AUTH METHODS ====== */
const doLogin = async () => {
  loggingIn.value = true;
  loginError.value = "";
  try {
    const { data } = await axios.post("/auth/login", loginForm.value);
    user.value = data;
    localStorage.setItem("vacaciones_user", JSON.stringify(data));
    form.value.empleadoId = data.id;
    form.value.empleadoNombre = data.nombre;
    tab.value = data.rol === "EMPLOYEE" ? "solicitud" : "lista";
  } catch (e) {
    console.error(e);
    loginError.value = "Usuario o contraseña incorrectos o backend no responde";
  } finally {
    loggingIn.value = false;
  }
};

const doRegister = async () => {
  registering.value = true;
  registerError.value = "";
  try {
    const { data } = await axios.post("/auth/register", registerForm.value);
    user.value = data;
    localStorage.setItem("vacaciones_user", JSON.stringify(data));
    form.value.empleadoId = data.id;
    form.value.empleadoNombre = data.nombre;
    tab.value = data.rol === "EMPLOYEE" ? "solicitud" : "lista";
    showingRegister.value = false;
    registerForm.value = {
      nombre: "",
      username: "",
      password: "",
      rol: "EMPLOYEE",
    };
  } catch (e) {
    console.error(e);
    registerError.value = e.response?.data?.message || "No se pudo registrar";
  } finally {
    registering.value = false;
  }
};

const logout = () => {
  user.value = null;
  localStorage.removeItem("vacaciones_user");
  tab.value = "solicitud";
};

/* ====== ROLES ====== */
const isEmployee = computed(() => user.value && user.value.rol === "EMPLOYEE");
const isTH = computed(() => user.value && user.value.rol === "TH");

/* ====== MOUNT ====== */
onMounted(() => {
  const saved = localStorage.getItem("vacaciones_user");
  if (saved) {
    user.value = JSON.parse(saved);
    form.value.empleadoId = user.value.id;
    form.value.empleadoNombre = user.value.nombre;
  }
  calcularAniosServicio();
});

/* ====== LOGICA DE VACACIONES ====== */
function calcularAniosServicio() {
  if (!fechaIngreso.value) {
    aniosServicio.value = null;
    diasDisponibles.value = 0;
    return;
  }
  const fIng = new Date(fechaIngreso.value);
  if (isNaN(fIng.getTime())) {
    aniosServicio.value = null;
    diasDisponibles.value = 0;
    return;
  }
  const hoy = new Date();
  let anios = hoy.getFullYear() - fIng.getFullYear();
  const m = hoy.getMonth() - fIng.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fIng.getDate())) {
    anios--;
  }
  anios = anios >= 0 ? anios : 0;
  aniosServicio.value = anios;

  if (anios < 1) {
    diasDisponibles.value = 0;
  } else if (anios >= 1 && anios <= 5) {
    diasDisponibles.value = 10;
  } else {
    diasDisponibles.value = 20;
  }

  calcularDiasSolicitados();
}

function calcularDiasSolicitados() {
  errorDias.value = "";
  const i = form.value.fechaInicio ? new Date(form.value.fechaInicio) : null;
  const f = form.value.fechaFin ? new Date(form.value.fechaFin) : null;
  if (!i || !f || isNaN(i.getTime()) || isNaN(f.getTime())) {
    form.value.diasSolicitados = null;
    return;
  }
  const diffMs = f.getTime() - i.getTime();
  if (diffMs < 0) {
    form.value.diasSolicitados = null;
    errorDias.value = "La fecha fin no puede ser menor que la fecha inicio.";
    return;
  }
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  form.value.diasSolicitados = dias;

  if (dias > diasDisponibles.value) {
    errorDias.value = `No puede solicitar ${dias} días. Solo tiene ${diasDisponibles.value} disponibles.`;
  }
}

const enviarSolicitud = async () => {
  if (!user.value) return;
  if (errorDias.value) return;
  cargando.value = true;
  mensaje.value = "";
  envioOk.value = false;
  try {
    const payload = {
      ...form.value,
      empleadoId: user.value.id,
      empleadoNombre: user.value.nombre,
    };
    const { data } = await axios.post("/api/vacaciones/empleado", payload);
    mensaje.value = `Solicitud registrada con ID ${data.id}`;
    envioOk.value = true;
    tab.value = "mis";
    await cargarMis();
  } catch (e) {
    console.error(e);
    mensaje.value = "Error al registrar";
    envioOk.value = false;
  } finally {
    cargando.value = false;
  }
};

/* ====== LISTAS ====== */
const cargarMis = async () => {
  if (!user.value) return;
  try {
    const { data } = await axios.get(`/api/vacaciones/empleado/${user.value.id}`);
    misSolicitudes.value = data;
  } catch (e) {
    console.error(e);
  }
};

const cargarTH = async () => {
  try {
    const { data } = await axios.get("/api/vacaciones/th");
    solicitudesTH.value = data;
  } catch (e) {
    console.error(e);
  }
};

const solicitudesFiltradas = computed(() => {
  if (!filtro.value) return solicitudesTH.value;
  const f = filtro.value.toLowerCase();
  return solicitudesTH.value.filter((s) => {
    return (
      String(s.id).includes(f) ||
      (s.empleadoNombre && s.empleadoNombre.toLowerCase().includes(f)) ||
      (s.estado && s.estado.toLowerCase().includes(f))
    );
  });
});

const seleccionarParaAprobacion = (s) => {
  seleccionada.value = { ...s };
  obs.value = s.observacion || "";
  tab.value = "aprobacion";
};

const decidir = async (aprobar) => {
  if (!seleccionada.value) return;
  try {
    await axios.put(`/api/vacaciones/th/${seleccionada.value.id}/decision`, {
      fechaInicio: seleccionada.value.fechaInicio,
      fechaFin: seleccionada.value.fechaFin,
      diasSolicitados: seleccionada.value.diasSolicitados,
      observacion: obs.value,
      aprobadoPor: user.value.id,
      aprobar,
    });
    await cargarTH();
    tab.value = "lista";
  } catch (e) {
    console.error(e);
  }
};
</script>

<style scoped>
.card{background:#fff;border:1px solid #e5e7eb;border-radius:1rem;box-shadow:0 1px 2px rgba(0,0,0,.06);padding:1rem}
.badge{display:inline-flex;align-items:center;border-radius:9999px;padding:.125rem .5rem;font-size:.75rem;font-weight:500}
.badge-blue{background:#dbeafe;color:#1e40af}
.badge-purple{background:#efeafe;color:#6b21a8}
.badge-amber{background:#fef3c7;color:#92400e}
.badge-green{background:#dcfce7;color:#166534}
.badge-red{background:#fee2e2;color:#991b1b}
.btn{padding:.5rem 1rem;border-radius:.5rem;color:#fff}
.btn-blue{background:#2563eb}
.btn-blue:hover{background:#1d4ed8}
.btn-green{background:#16a34a}
.btn-green:hover{background:#15803d}
.btn-red{background:#dc2626}
.btn-red:hover{background:#b91c1c}
.input{border:1px solid #e5e7eb;border-radius:.5rem;padding:.5rem .75rem}
.label{font-size:.875rem;color:#6b7280;margin-bottom:.25rem}
.tabs button[aria-selected="true"]{background:#fff;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-top:1px solid #e5e7eb;margin-bottom:-1px;font-weight:600}
.tabs button[aria-selected="false"]{color:#4b5563}
</style>
