import { app } from "./app.js";
import { connectDB } from "./config/database.js";
import { PORT } from "./config/env.js";
import { authService } from "./services/auth.service.js";

async function bootstrap() {
  await connectDB();
  await authService.ensureAdminUser();
  app.listen(PORT, (error?: Error) => {
    if (error) throw error;
    console.log(`Servidor Express 5 escucha en http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("No se pudo arrancar el servidor: ", error);
  process.exit(1);
});
