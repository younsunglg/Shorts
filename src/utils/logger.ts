export class Logger {
  static info(message: string) {
    console.log(`ℹ️  ${message}`);
  }

  static success(message: string) {
    console.log(`✅ ${message}`);
  }

  static error(message: string) {
    console.error(`❌ ${message}`);
  }

  static warn(message: string) {
    console.warn(`⚠️  ${message}`);
  }

  static progress(message: string) {
    console.log(`⏳ ${message}`);
  }
}
