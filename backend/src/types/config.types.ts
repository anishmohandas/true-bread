export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string | undefined;
    ssl?: {
        rejectUnauthorized: boolean;
    };
    client_encoding?: string;
}

export interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
}

export interface AppConfig {
    database: DatabaseConfig;
    email: EmailConfig;
    baseUrl: string;
    backendUrl: string;
    port: number;
    /** Absolute path of the frontend's served `assets` folder, where admin uploads are saved */
    frontendAssetsDir: string;
}
