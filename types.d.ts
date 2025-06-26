declare module 'expo-firebase-crashlytics' {
  interface CrashlyticsModule {
    log(message: string): void;
    recordError(error: Error): void;
    setUserId(id: string): void;
    setAttribute(key: string, value: string): void;
    setAttributes(attributes: Record<string, string>): void;
  }

  const crashlytics: CrashlyticsModule;

  export default crashlytics;
}
