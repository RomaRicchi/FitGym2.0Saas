import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import gymApi from "@/api/gymApi";

export default function AdminIngresos() {
  const [ingresos, setIngresos] = useState<{ nombreMes: string; ingresos: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await gymApi.get("/dashboard/ingresos-mensuales");
        setIngresos(data);
      } catch (err) {
        console.error("Error cargando ingresos:", err);
      }
    };
    fetchData();
  }, []);

  const totalAnual = ingresos.reduce((acc, i) => acc + (i.ingresos || 0), 0);

  return (
    <div className="container mt-5">
      <h1 className="text-center fw-bold mb-4" style={{ color: "#ff6600" }}>
        💰 Ingresos Mensuales
      </h1>

      {/* 🔹 Resumen anual */}
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
          textAlign: "center",
          color: "#fff",
          fontSize: "1.3rem",
          fontWeight: 600,
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        Total anual:{" "}
        <span style={{ color: "#ff6600", fontWeight: "bold" }}>
          {new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0,
          }).format(totalAnual)}
        </span>
      </div>

      {/* 🔸 Gráfico principal */}
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          padding: "1rem",
        }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={ingresos}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="nombreMes" stroke="#fff" />
            <YAxis
              stroke="#fff"
              tickFormatter={(value) =>
                new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  maximumFractionDigits: 0,
                }).format(value)
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#000",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 0,
                }).format(value)
              }
            />
            <Legend wrapperStyle={{ color: "#fff" }} />
            <Bar dataKey="ingresos" fill="#ff6600" name="Ingresos" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
