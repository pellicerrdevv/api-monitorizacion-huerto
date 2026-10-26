import { ConflictError, NotFoundError } from "../errors/http.errors.js";
import { SensorModel } from "../models/sensor.model.js";
import type {
  CreateSensorDTO,
  UpdateSensorDTO,
} from "../schemas/sensor.schema.js";
import type { ISensor } from "../models/sensor.model.js";

export class SensorsService {
  async getAllSensors(): Promise<ISensor[]> {
    return SensorModel.find().sort({ createdAt: -1 }).exec();
  }

  async getSensorById(id: string): Promise<ISensor> {
    const sensor = await SensorModel.findById(id).exec();
    if (!sensor) {
      throw new NotFoundError(`No se ha encontrado el sensor con id: ${id}`);
    }
    return sensor;
  }

  async createSensor(input: CreateSensorDTO): Promise<ISensor> {
    const sensor = await SensorModel.findOne({ code: input.code }).exec();
    if (sensor) {
      throw new ConflictError(
        `Ya existe un sensor con el código ${input.code}`,
      );
    }
    return SensorModel.create(input);
  }

  async updateSensor(id: string, input: UpdateSensorDTO): Promise<ISensor> {
    const sensor = await SensorModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    }).exec();

    if (!sensor) {
      throw new NotFoundError(`No existe ningún sensor con id: ${id}`);
    }

    return sensor;
  }

  async deleteSensor(id: string): Promise<void> {
    const sensorEliminado = await SensorModel.findByIdAndDelete(id).exec();
    if (!sensorEliminado) {
      throw new NotFoundError(`No se ha encontrado el sensor con id: ${id}`);
    }
  }
}

export const sensorsService = new SensorsService();
