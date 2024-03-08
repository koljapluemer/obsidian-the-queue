// settings.service.ts

interface UserSettings {
    [key: string]: any;
}

export class SettingsService {
    private readonly STORAGE_KEY = 'user_settings';

    loadSettings(): UserSettings {
        const settingsString = localStorage.getItem(this.STORAGE_KEY);
        return settingsString ? JSON.parse(settingsString) : {};
    }

    saveSettings(settings: UserSettings): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    }
}
