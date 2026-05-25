// ImuSensor: Yahboom IMU via serial port
import SerialPort from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

export class ImuSensor {
  private port: any;
  private parser: any;
  constructor(device = '/dev/ttyUSB0', baudRate = 115200) {
    this.port = new SerialPort(device, { baudRate });
    this.parser = this.port.pipe(new ReadlineParser());
  }
  async *frames() {
    for await (const line of this.parser) {
      // Parse Yahboom IMU protocol: accel xyz, gyro xyz, mag xyz
      const parts = line.trim().split(',').map(Number);
      if (parts.length === 9) {
        yield {
          accel: parts.slice(0, 3),
          gyro: parts.slice(3, 6),
          mag: parts.slice(6, 9),
        };
      }
    }
  }
}
