<template>
  <div class="app-shell">
    <main class="page">

      <!-- ===== LOGIN / REGISTRO ===== -->
      <section v-if="!user" class="auth-shell">
        <div class="auth-card">
          <!-- LOGIN -->
          <template v-if="!showingRegister">
            <h1 class="auth-title">Iniciar sesión</h1>
            <p class="auth-subtitle">
              Usa: <code>empleado1 / 1234</code> o <code>th1 / 1234</code>.
            </p>
            <form class="form-grid" @submit.prevent="doLogin">
              <div>
                <label class="label">Usuario</label>
                <input v-model="loginForm.username" type="text" class="input w-full" autocomplete="username" />
              </div>
              <div>
                <label class="label">Contraseña</label>
                <input v-model="loginForm.password" type="password" class="input w-full" autocomplete="current-password" />
              </div>
              <button type="submit" class="btn btn-primary w-full" :disabled="loggingIn">
                {{ loggingIn ? 'Ingresando...' : 'Entrar' }}
              </button>
              <p v-if="loginError" class="alert-error">{{ loginError }}</p>
            </form>
            <p class="auth-foot">
              ¿No tienes cuenta?
              <button class="link" @click="showingRegister = true">
                Crear nueva
              </button>
            </p>
          </template>

          <!-- REGISTRO -->
          <template v-else>
            <h1 class="auth-title">Registrar nuevo usuario</h1>
            <p class="auth-subtitle">
              Crea un empleado o un usuario de Talento Humano.
            </p>
            <form class="form-grid" @submit.prevent="doRegister">
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
              <button type="submit" class="btn btn-primary w-full" :disabled="registering">
                {{ registering ? 'Creando...' : 'Registrar' }}
              </button>
              <p v-if="registerError" class="alert-error">{{ registerError }}</p>
            </form>
            <p class="auth-foot">
              ¿Ya tienes cuenta?
              <button class="link" @click="showingRegister = false">
                Volver a iniciar sesión
              </button>
            </p>
          </template>
        </div>
      </section>

      <!-- ===== APP ===== -->
      <section v-else class="content-shell">
        <!-- top bar -->
        <header class="topbar">
          <div>
            <h1 class="page-title">Sistema de Vacaciones</h1>
            <p class="page-subtitle">
              Hola {{ user.nombre }} · <span class="role-pill">{{ user.rol }}</span>
            </p>
          </div>
          <button class="btn-ghost" @click="logout">Cerrar sesión</button>
        </header>

        <!-- tabs -->
        <nav class="tabs" role="tablist">
          <button
            v-if="isEmployee"
            class="tab"
            :class="{ active: tab === 'solicitud' }"
            :aria-selected="tab === 'solicitud'"
            @click="tab = 'solicitud'"
          >
            1) Solicitud (Empleado)
          </button>
          <button
            v-if="isEmployee"
            class="tab"
            :class="{ active: tab === 'mis' }"
            :aria-selected="tab === 'mis'"
            @click="cargarMis(); tab = 'mis'"
          >
            2) Mis solicitudes
          </button>
          <button
            v-if="isTH"
            class="tab"
            :class="{ active: tab === 'lista' }"
            :aria-selected="tab === 'lista'"
            @click="cargarTH(); tab = 'lista'"
          >
            3) Lista (Talento Humano)
          </button>
          <button
            v-if="isTH"
            class="tab"
            :class="{ active: tab === 'aprobacion' }"
            :aria-selected="tab === 'aprobacion'"
            @click="tab = 'aprobacion'"
          >
            4) Aprobación (TH)
          </button>
        </nav>

        <!-- 1) Solicitud -->
        <section v-if="tab === 'solicitud' && (isEmployee || isTH)" class="card">
          <div class="card-head">
            <div>
              <h2 class="card-title">Solicitud de vacaciones</h2>
              <p class="card-text">La validación/reglas las agregas tú.</p>
            </div>
            <span class="badge badge-blue">Empleado</span>
          </div>

          <form class="grid md:grid-cols-2 gap-4" @submit.prevent="enviarSolicitud">
            <div class="col-span-2 grid md:grid-cols-3 gap-4">
              <div class="flex flex-col gap-1">
                <span class="label">Fecha de ingreso</span>
                <input
                  type="date"
                  class="input"
                  v-model="fechaIngreso"
                  @change="calcularAniosServicio"
                />
              </div>
              <div class="status-box">
                <div>
                  <div class="status-label">Años de servicio</div>
                  <div class="status-value">{{ aniosServicio ?? '—' }}</div>
                </div>
                <div>
                  <div class="status-label">Días disponibles</div>
                  <div class="status-value">{{ diasDisponibles }}</div>
                </div>
              </div>
            </div>

            <label class="flex flex-col gap-1">
              <span class="label">Fecha inicio</span>
              <input
                type="date"
                class="input"
                v-model="form.fechaInicio"
                @change="calcularDiasSolicitados"
              />
            </label>
            <label class="flex flex-col gap-1">
              <span class="label">Fecha fin</span>
              <input
                type="date"
                class="input"
                v-model="form.fechaFin"
                @change="calcularDiasSolicitados"
              />
            </label>

            <div class="col-span-2 flex flex-wrap items-center gap-4 bg-slate-50 rounded-lg px-3 py-2">
              <div class="text-sm">
                Días solicitados: <b>{{ form.diasSolicitados || '—' }}</b>
              </div>
              <div v-if="errorDias" class="text-sm text-red-600">
                {{ errorDias }}
              </div>
            </div>

            <div class="col-span-2 flex gap-2 items-center">
              <button type="submit" class="btn btn-primary" :disabled="cargando || !!errorDias">
                {{ cargando ? 'Enviando...' : 'Registrar solicitud' }}
              </button>
              <span class="text-sm" :class="envioOk ? 'text-emerald-600' : 'text-slate-500'">
                {{ mensaje }}
              </span>
            </div>
          </form>
        </section>

        <!-- 2) Mis solicitudes -->
        <section v-if="tab === 'mis' && isEmployee" class="card">
          <div class="card-head">
            <div>
              <h2 class="card-title">Mis solicitudes</h2>
              <p class="card-text">Consulta el estado de cada solicitud</p>
            </div>
            <span class="badge badge-blue">Empleado</span>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Días</th>
                  <th>Estado</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in misSolicitudes" :key="s.id">
                  <td>{{ s.id }}</td>
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
                  <td class="text-slate-500">{{ s.observacion || '—' }}</td>
                </tr>
                <tr v-if="misSolicitudes.length === 0">
                  <td colspan="6" class="empty">Sin solicitudes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 3) Lista global TH -->
        <section v-if="tab === 'lista' && isTH" class="card">
          <div class="card-head">
            <div>
              <h2 class="card-title">Solicitudes de empleados</h2>
              <p class="card-text">Vista de Talento Humano</p>
            </div>
            <span class="badge badge-purple">Talento Humano</span>
          </div>

          <div class="flex items-center gap-2 mb-3">
            <input class="input w-full md:w-72" placeholder="Buscar por empleado, # o estado" v-model="filtro" />
            <button class="btn btn-primary" @click="cargarTH">Refrescar</button>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
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
                  class="row-click"
                  @click="seleccionarParaAprobacion(s)"
                >
                  <td>{{ s.id }}</td>
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
                  <td colspan="7" class="empty">Sin datos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 4) Aprobación -->
        <section v-if="tab === 'aprobacion' && isTH" class="card">
          <div class="card-head">
            <div>
              <h2 class="card-title">Aprobación de solicitudes</h2>
              <p class="card-text">Aprobar con o sin cambios, o negar</p>
            </div>
            <span class="badge badge-purple">Talento Humano</span>
          </div>

          <div class="text-sm text-slate-700 mb-4">
            <template v-if="seleccionada">
              Solicitud #{{ seleccionada.id }} — {{ seleccionada.empleadoNombre || '—' }}
            </template>
            <template v-else>
              Selecciona una solicitud en la pestaña 3)
            </template>
          </div>

          <div class="grid md:grid-cols-2 gap-4" v-if="seleccionada">
            <label class="flex flex-col gap-1">
              <span class="label">Fecha inicio</span>
              <input type="date" class="input" v-model="seleccionada.fechaInicio" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="label">Fecha fin</span>
              <input type="date" class="input" v-model="seleccionada.fechaFin" />
            </label>
            <div class="md:col-span-2 bg-slate-50 rounded-lg px-3 py-2 text-sm">
              Días calculados: <b>{{ seleccionada.diasSolicitados || '—' }}</b>
            </div>
            <label class="md:col-span-2 flex flex-col gap-1">
              <span class="label">Observación (opcional)</span>
              <textarea class="input" rows="3" v-model="obs"></textarea>
            </label>
            <div class="md:col-span-2 flex flex-wrap gap-2">
              <button type="button" class="btn btn-success" @click="decidir(true)">Aprobar</button>
              <button type="button" class="btn btn-danger" @click="decidir(false)">Negar</button>
            </div>
          </div>
        </section>

        <footer class="footer">
          * Vue consumiendo tu backend (<code>http://localhost:8080</code>).
        </footer>
      </section>
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
.app-shell {
  min-height: 100vh;
  background: #f5f6f8;
  display: flex;
  justify-content: center;
}

.page {
  width: 100%;
  max-width: 1120px;
  padding: 1.75rem 1rem 3rem;
}

/* ===== AUTH ===== */
.auth-shell {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid rgba(15,23,42,0.05);
  border-radius: 1.1rem;
  padding: 1.8rem 1.5rem 1.7rem;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.04);
}
.auth-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #0f172a;
}
.auth-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: .3rem;
}
.form-grid {
  display: grid;
  gap: .85rem;
  margin-top: 1.15rem;
}
.auth-foot {
  margin-top: 1.3rem;
  font-size: .75rem;
  color: #64748b;
  text-align: center;
}

/* ===== CONTENT ===== */
.content-shell {
  margin-top: 1.5rem;
}

/* top bar */
.topbar {
  background: #fff;
  border: 1px solid rgba(15,23,42,0.03);
  border-radius: .9rem .9rem 0 0;
  padding: 1rem 1.25rem .75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.2rem;
  box-shadow: 0 10px 25px rgba(15,23,42,0.02);
}
.page-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: .2rem;
}
.page-subtitle {
  font-size: .7rem;
  color: #94a3b8;
}
.role-pill {
  background: rgba(148,163,184,0.12);
  padding: .1rem .5rem;
  border-radius: 9999px;
  font-size: .6rem;
  text-transform: uppercase;
  color: #475569;
  letter-spacing: .02em;
}
.btn-ghost {
  background: #fff;
  border: 1px solid rgba(248,113,113,0.35);
  color: #b91c1c;
  border-radius: .75rem;
  padding: .4rem .75rem;
  font-size: .7rem;
}

/* tabs */
.tabs {
  display: flex;
  gap: .35rem;
  background: #fff;
  border-bottom: 1px solid rgba(15,23,42,0.05);
  padding: 0 .75rem;
}
.tab {
  background: transparent;
  border: none;
  font-size: .7rem;
  padding: .6rem .8rem .35rem;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.tab.active {
  color: #0f172a;
  border-bottom-color: #2563eb;
  font-weight: 500;
}

/* cards */
.card {
  background: #fff;
  border: 1px solid rgba(15,23,42,0.03);
  border-radius: 0 0 .9rem .9rem;
  padding: 1.25rem 1rem 1.1rem;
  box-shadow: 0 10px 25px rgba(15,23,42,.01);
  margin-bottom: 1rem;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}
.card-title {
  font-weight: 600;
  color: #0f172a;
  font-size: 1rem;
}
.card-text {
  font-size: .7rem;
  color: #94a3b8;
  margin-top: .2rem;
}

/* status box */
.status-box {
  display: flex;
  gap: 1.2rem;
  align-items: center;
  background: #f8fafc;
  border: 1px solid rgba(148,163,184,0.12);
  border-radius: .7rem;
  padding: .6rem .85rem;
}
.status-label {
  font-size: .6rem;
  color: #94a3b8;
}
.status-value {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

/* inputs */
.input {
  border: 1px solid rgba(148,163,184,0.35);
  border-radius: .6rem;
  padding: .45rem .55rem;
  font-size: .75rem;
  background: #fff;
}
.input:focus {
  outline: none;
  border-color: rgba(37,99,235,0.55);
  box-shadow: 0 0 0 2px rgba(37,99,235,0.09);
}
.label {
  font-size: .65rem;
  color: #475569;
  margin-bottom: .25rem;
}

/* buttons */
.btn {
  padding: .5rem .9rem;
  border-radius: .6rem;
  font-weight: 500;
  border: none;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
}
.btn-success {
  background: #16a34a;
  color: #fff;
}
.btn-danger {
  background: #dc2626;
  color: #fff;
}

/* badges */
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: .2rem .55rem;
  font-size: .6rem;
  font-weight: 500;
}
.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-purple { background: #efeafe; color: #6b21a8; }
.badge-amber { background: #fef3c7; color: #92400e; }
.badge-green { background: #dcfce7; color: #166534; }
.badge-red { background: #fee2e2; color: #991b1b; }

/* tables */
.table-wrap {
  border: 1px solid rgba(15,23,42,0.03);
  border-radius: .7rem;
  overflow: hidden;
}
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: .7rem;
}
.table thead {
  background: #f8fafc;
}
.table th,
.table td {
  padding: .55rem .65rem;
  text-align: left;
}
.table th {
  color: #475569;
  font-weight: 600;
}
.table tbody tr:nth-child(even) {
  background: rgba(248,250,252,.3);
}
.row-click:hover {
  background: rgba(226,232,255,0.35);
  cursor: pointer;
}
.empty {
  text-align: center;
  padding: 1.2rem 0;
  color: #cbd5f5;
}

/* misc */
.link {
  color: #2563eb;
  text-decoration: underline;
  font-weight: 500;
}
.alert-error {
  background: rgba(254,226,226,0.8);
  color: #991b1b;
  padding: .35rem .5rem;
  border-radius: .5rem;
  font-size: .65rem;
}
.footer {
  font-size: .6rem;
  color: #94a3b8;
  margin-top: .5rem;
}
@media (max-width: 720px) {
  .topbar { flex-direction: column; align-items: flex-start; }
  .tabs { flex-wrap: wrap; }
  .card { border-radius: .8rem; }
}
</style>