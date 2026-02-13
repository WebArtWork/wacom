export {};

// Add capitalize method to String prototype if it doesn't already exist
if (!String.prototype.capitalize) {
	String.prototype.capitalize = function (): string {
		if (this.length > 0) {
			return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
		}
		return '';
	};
}

// Extend the String interface to include the new method
declare global {
	interface String {
		capitalize(): string;
	}
}
