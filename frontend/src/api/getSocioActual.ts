import gymApi from "./gymApi";

export async function getSocioActual() {
  try {
    const { data } = await gymApi.get("/usuarios/perfil");
    if (data && data.socio) return data.socio;
    if (data && data.socio_id) {
      const socioRes = await gymApi.get(`/socios/${data.socio_id}`);
      return socioRes.data;
    }
    return null;
  } catch (err) {
    return null;
  }
}
