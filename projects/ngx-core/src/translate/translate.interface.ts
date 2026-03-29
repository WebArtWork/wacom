export interface Translate {
	sourceText: string;
	text: string;
}

export type TranslateConfigTranslations = Record<string, Translate[]>;

export interface TranslateFileLoaderConfig {
	folder?: string;
}

export interface ProvideTranslateConfig extends TranslateFileLoaderConfig {
	language?: string;
	defaultLanguage?: string;
	translations?: TranslateConfigTranslations;
	persistLanguage?: boolean;
}
