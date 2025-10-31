import { createRouter, createWebHistory } from "vue-router";
import SolicitudView from "@/views/SolicitudView.vue";
import MisSolicitudesView from "@/views/MisSolicitudesView.vue";
import THListaView from "@/views/THListaView.vue";

const routes = [
  { path: "/", redirect: "/empleado/solicitud" },
  { path: "/empleado/solicitud", component: SolicitudView },
  { path: "/empleado/mis-solicitudes", component: MisSolicitudesView },
  { path: "/th/solicitudes", component: THListaView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
